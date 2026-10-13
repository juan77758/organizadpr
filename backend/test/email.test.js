const { test } = require('node:test');
const assert = require('node:assert/strict');

test('HTTPS email escapes user content, uses Mexico time and retries with a stable key', async t => {
  process.env.RESEND_API_KEY = 'test-only-api-key';
  process.env.EMAIL_FROM = 'Organizador <sender@example.invalid>';
  process.env.APP_URL = 'https://board.example.test';
  process.env.APP_TIME_ZONE = 'America/Mexico_City';
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ id: 'test-message-id' }), { status: 200 });
  };
  const { sendReminderEmail } = require('../src/services/emailService');
  const outcome = await sendReminderEmail('recipient@example.invalid', '<script>alert(1)</script>', {
    title: '<img src=x onerror=alert(1)>', description: 'A & B',
    priority: 'alta', category: '<b>Personal</b>', due_date: '2026-10-13T03:57:00Z'
  }, 42);
  assert.equal(outcome.success, true);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].options.headers['Idempotency-Key'], 'notification-42');
  const payload = JSON.parse(calls[0].options.body);
  assert.deepEqual(payload.to, ['recipient@example.invalid']);
  assert.match(payload.html, /&lt;script&gt;/);
  assert.match(payload.html, /&lt;img/);
  assert.match(payload.html, /A &amp; B/);
  assert.doesNotMatch(payload.html, /<script>/);
  assert.match(payload.html, /21:57/);
  global.fetch = async () => new Response('', { status: 429 });
  const failed = await sendReminderEmail('recipient@example.invalid', 'Test', {
    title: 'Test', due_date: '2026-10-13T03:57:00Z', priority: 'alta'
  }, 42);
  assert.equal(failed.success, false);
  assert.match(failed.error, /429/);
});
