const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Server } = require('socket.io');
const { io: connect } = require('../../frontend/node_modules/socket.io-client');
const { parseDueDate } = require('../src/utils/dateTime');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = '';
process.env.JWT_SECRET = 'test-only-signing-key';
process.env.JWT_EXPIRES_IN = '1h';
const email = require('../src/services/emailService');
const deliveries = [];
let emailSucceeds = true;
email.sendReminderEmail = async (address, name, activity) => {
  deliveries.push({ address, name, title: activity.title });
  return emailSucceeds ? { success: true } : { success: false, error: 'Simulated SMTP failure' };
};
const reminders = require('../src/services/notificationService');
const app = require('../src/app');
const setupSockets = require('../src/socket/socketHandlers');

test('local time converts to UTC and invalid zones are rejected', () => {
  assert.equal(parseDueDate('2026-10-12T21:57', 'America/Mexico_City').toISOString(), '2026-10-13T03:57:00.000Z');
  assert.equal(parseDueDate('2026-10-13T03:57:00Z').toISOString(), '2026-10-13T03:57:00.000Z');
  assert.equal(parseDueDate('2026-10-12T21:57', 'invalid'), null);
});

test('registration, board CRUD and imminent reminders with email and realtime delivery', async (t) => {
  const server = http.createServer(app);
  const sockets = new Server(server);
  setupSockets(sockets);
  app.set('io', sockets);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => sockets.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = 'GET', body, token) {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: response.status, ...(await response.json()) };
  }
  const credentials = { email: 'reminders@example.invalid', password: 'test-password', name: 'Reminder test' };
  const registration = await request('/api/auth/register', 'POST', credentials);
  assert.equal(registration.status, 201);
  const token = registration.token;
  assert.equal(registration.user.email, credentials.email);
  assert.equal((await request('/api/auth/login', 'POST', credentials)).status, 200);
  assert.equal((await request('/api/auth/me', 'GET', undefined, token)).user.name, credentials.name);
  const other = await request('/api/auth/register', 'POST', { ...credentials, email: 'other@example.invalid' });
  const create = async (title, minutes, status) => {
    const created = await request('/api/activities', 'POST', {
      title, due_date: new Date(Date.now() + minutes * 60000).toISOString(), priority: 'alta'
    }, token);
    assert.equal(created.status, 201);
    if (status) assert.equal((await request(`/api/activities/${created.activity.id}/status`, 'PATCH', { status }, token)).status, 200);
    return created.activity;
  };
  const imminent = await create('Due soon', 3);
  await create('Too far away', 120);
  await create('Already completed', 2, 'completado');
  await create('Old overdue', -120);
  assert.equal((await request(`/api/activities/${imminent.id}`, 'GET', undefined, other.token)).status, 404);
  assert.equal((await request(`/api/activities/${imminent.id}`, 'PUT', { title: 'Updated soon' }, token)).activity.title, 'Updated soon');
  const client = connect(base, { auth: { token }, transports: ['websocket'], reconnection: false });
  t.after(() => client.disconnect());
  await new Promise((resolve, reject) => {
    client.once('connect', resolve); client.once('connect_error', reject);
    setTimeout(() => reject(Error('Socket connection timeout')), 3000).unref();
  });
  const event = new Promise((resolve, reject) => {
    client.once('new_notification', resolve);
    setTimeout(() => reject(Error('Notification timeout')), 3000).unref();
  });
  await reminders.processImminentActivities(sockets);
  const notification = await event;
  assert.equal(notification.type, 'imminent');
  assert.match(notification.message, /Updated soon/);
  assert.equal(notification.playSound, true);
  assert.equal(notification.urgent, true);
  assert.deepEqual(deliveries, [{ address: credentials.email, name: credentials.name, title: 'Updated soon' }]);
  await reminders.processImminentActivities(sockets);
  assert.equal(deliveries.length, 1, 'second scan must not repeat the reminder');
  const list = await request('/api/notifications', 'GET', undefined, token);
  assert.equal(list.notifications.length, 1);
  assert.equal(list.notifications[0].activity_title, 'Updated soon');
  assert.equal((await request('/api/notifications/unread-count', 'GET', undefined, token)).unreadCount, 1);
  assert.equal((await request(`/api/notifications/${notification.id}/read`, 'PATCH', {}, other.token)).status, 404);
  await request(`/api/notifications/${notification.id}/read`, 'PATCH', {}, token);
  assert.equal((await request('/api/notifications/unread-count', 'GET', undefined, token)).unreadCount, 0);
  await create('Reminder without email', 3);
  emailSucceeds = false;
  const failedEmailEvent = new Promise((resolve, reject) => {
    client.once('new_notification', resolve);
    setTimeout(() => reject(Error('App notification missing when SMTP fails')), 3000).unref();
  });
  await reminders.processImminentActivities(sockets);
  assert.match((await failedEmailEvent).message, /Reminder without email/);
  assert.equal((await request('/api/notifications/unread-count', 'GET', undefined, token)).unreadCount, 1);
  await request('/api/notifications/read-all', 'PATCH', {}, token);
  assert.equal((await request('/api/notifications/unread-count', 'GET', undefined, token)).unreadCount, 0);
  const remaining = (await request('/api/notifications', 'GET', undefined, token)).notifications.find(n => n.activity_id !== imminent.id);
  assert.equal((await request(`/api/notifications/${remaining.id}`, 'DELETE', undefined, token)).status, 200);
  assert.equal((await request(`/api/activities/${imminent.id}`, 'DELETE', undefined, token)).status, 200);
  assert.equal((await request('/api/notifications', 'GET', undefined, token)).notifications.length, 0);
});
