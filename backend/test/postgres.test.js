const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { Server } = require('socket.io');
const { io: connect } = require('../../frontend/node_modules/socket.io-client');

// Exige una base aislada de pruebas; no usar una base con datos de usuarios.
test('PostgreSQL: persistent users, isolated boards, delivery retries and production routes', {
  skip: !process.env.TEST_DATABASE_URL
}, async t => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DB_SSL = 'false';
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'test-only-signing-key-with-more-than-32-characters';
  process.env.FRONTEND_URL = 'https://board.example.test';
  process.env.APP_URL = process.env.FRONTEND_URL;
  process.env.EMAIL_FROM = 'test@example.invalid';
  const pool = require('../src/config/database');
  let sockets;
  let client;
  let cleanupIds = [];
  t.after(async () => {
    client?.disconnect();
    if (sockets) await new Promise(resolve => sockets.close(resolve));
    if (cleanupIds.length) await pool.query('DELETE FROM users WHERE id = ANY($1::int[])', [cleanupIds]);
    await pool.end();
  });
  const { createTables } = require('../src/config/initDatabase');
  await createTables();
  await createTables(); // Repetir la inicialización no borra datos.
  const mail = require('../src/services/emailService');
  let mailWorks = false;
  const deliveries = [];
  mail.sendReminderEmail = async address => {
    deliveries.push(address);
    return { success: mailWorks };
  };
  const reminders = require('../src/services/notificationService');
  const app = require('../src/app');
  const server = http.createServer(app);
  sockets = new Server(server);
  require('../src/socket/socketHandlers')(sockets);
  app.set('io', sockets);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = 'GET', body, token) {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { ...(await response.json()), status: response.status };
  }
  assert.equal((await request('/ready')).status, 200);
  const unique = Date.now();
  const user1 = await request('/api/auth/register', 'POST', { email: `first-${unique}@example.invalid`, password: 'test-password', name: 'First' });
  const user2 = await request('/api/auth/register', 'POST', { email: `second-${unique}@example.invalid`, password: 'test-password', name: 'Second' });
  assert.equal(user1.status, 201); assert.equal(user2.status, 201);
  cleanupIds = [user1.user.id, user2.user.id];
  assert.equal((await request('/api/auth/login', 'POST', { email: user1.user.email, password: 'test-password' })).status, 200);
  const imminent = await request('/api/activities', 'POST', { title: 'Persistent task', due_date: new Date(Date.now() + 180000).toISOString() }, user1.token);
  assert.equal(imminent.status, 201);
  assert.equal((await request('/api/activities', 'GET', undefined, user2.token)).activities.length, 0);
  assert.equal((await request(`/api/activities/${imminent.activity.id}/status`, 'PATCH', { status: 'completado' }, user2.token)).status, 404);
  for (const status of ['en_proceso', 'completado', 'pendiente']) {
    const changed = await request(`/api/activities/${imminent.activity.id}/status`, 'PATCH', { status }, user1.token);
    assert.equal(changed.activity.status, status);
  }
  assert.equal((await request('/api/test/test-notification', 'POST', {}, user1.token)).status, 404);
  assert.equal((await request('/api/notifications/check-now', 'POST', {}, user1.token)).status, 404);
  client = connect(base, { auth: { token: user1.token }, transports: ['websocket'], reconnection: false });
  await new Promise((resolve, reject) => {
    client.once('connect', resolve); client.once('connect_error', reject);
    setTimeout(() => reject(Error('Socket timeout')), 3000).unref();
  });
  const event = new Promise((resolve, reject) => {
    client.once('new_notification', resolve);
    setTimeout(() => reject(Error('Reminder event missing')), 3000).unref();
  });
  await reminders.processImminentActivities(sockets);
  const notification = await event;
  assert.equal(notification.type, 'imminent'); assert.equal(notification.urgent, true);
  assert.deepEqual(deliveries, [user1.user.email]);
  const stored = await pool.query('SELECT * FROM notifications WHERE id = $1', [notification.id]);
  assert.equal(stored.rows[0].email_status, 'failed');
  await pool.query('UPDATE notifications SET email_next_attempt_at = CURRENT_TIMESTAMP WHERE id = $1', [notification.id]);
  mailWorks = true;
  await reminders.processPendingEmails();
  const sent = await pool.query('SELECT * FROM notifications WHERE id = $1', [notification.id]);
  assert.equal(sent.rows[0].email_status, 'sent'); assert.equal(sent.rows[0].email_attempts, 2);
  const before = deliveries.length;
  await Promise.all([reminders.processImminentActivities(sockets), reminders.processImminentActivities(sockets)]);
  assert.equal(deliveries.length, before);
  assert.equal((await request('/api/notifications', 'GET', undefined, user2.token)).notifications.length, 0);
  assert.equal((await request('/api/notifications/unread-count', 'GET', undefined, user1.token)).unreadCount, 1);
  const restored = execFileSync(process.execPath, ['-e', `
    const pool = require('./src/config/database');
    pool.query('SELECT title FROM activities WHERE id = $1', [${imminent.activity.id}])
      .then(r => { if (r.rows[0]?.title !== 'Persistent task') process.exitCode = 1; })
      .catch(() => { process.exitCode = 1; }).finally(() => pool.end());
  `], { cwd: require('node:path').resolve(__dirname, '..'), env: process.env });
  assert.equal(restored.length, 0, 'a separate Node process reads the persistent task');
});
