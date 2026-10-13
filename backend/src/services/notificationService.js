const pool = require('../config/database');
const { sendReminderEmail } = require('./emailService');

const schedules = {
  imminent: { interval: '10 minutes', urgent: true },
  email_24h: { interval: '23 hours', urgent: false },
  overdue: { interval: '1 day', urgent: false }
};
let running = false;

// Un solo proceso a la vez, incluso durante un redeploy con dos instancias.
async function exclusive(work) {
  if (running) return;
  running = true;
  let client;
  let locked = false;
  try {
    if (pool.connect) {
      client = await pool.connect();
      const result = await client.query('SELECT pg_try_advisory_lock($1) AS locked', [704291]);
      locked = result.rows[0].locked;
      if (!locked) return;
    }
    return await work();
  } finally {
    try {
      if (locked) await client.query('SELECT pg_advisory_unlock($1)', [704291]);
    } finally {
      client?.release();
      running = false;
    }
  }
}

exports.createNotification = async (userId, activityId, type, message) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, activity_id, type, message, sent_at, email_status)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5) RETURNING *`,
    [userId, activityId, type, message, type === 'overdue' || type === 'test' ? 'none' : 'pending']
  );
  return result.rows[0];
};

async function deliver(notification, activity) {
  let outcome;
  try {
    outcome = await sendReminderEmail(activity.email, activity.user_name, activity, notification.id);
  } catch {
    outcome = { success: false };
  }
  if (pool.connect) {
    await pool.query(
      `UPDATE notifications SET email_status = $1,
       email_attempts = email_attempts + 1,
       email_next_attempt_at = CURRENT_TIMESTAMP + INTERVAL '1 minute'
       WHERE id = $2`,
      [outcome.success ? 'sent' : 'failed', notification.id]
    );
  }
  console.log(outcome.success ? 'Correo aceptado por el proveedor'
    : pool.connect ? 'Correo pendiente de reintento' : 'Correo no enviado');
}

async function pendingEmails() {
  if (!pool.connect) return;
  const result = await pool.query(
    `SELECT n.id AS notification_id, a.*, u.email, u.name AS user_name
     FROM notifications n
     JOIN activities a ON a.id = n.activity_id
     JOIN users u ON u.id = n.user_id
     WHERE n.email_status IN ('pending', 'failed')
       AND n.email_attempts < 5
       AND (n.email_next_attempt_at IS NULL OR n.email_next_attempt_at <= CURRENT_TIMESTAMP)
       AND n.created_at > CURRENT_TIMESTAMP - INTERVAL '1 day'
       AND a.status != 'completado'
     ORDER BY n.created_at ASC LIMIT 100`
  );
  for (const activity of result.rows) {
    await deliver({ id: activity.notification_id }, activity);
  }
}

async function processActivities(type, io) {
  return exclusive(async () => {
    const now = new Date();
    const schedule = schedules[type];
    let bounds;
    let dates;
    if (type === 'imminent') {
      bounds = 'a.due_date BETWEEN $1 AND $2';
      dates = [new Date(now.getTime() - 300000), new Date(now.getTime() + 300000)];
    } else if (type === 'email_24h') {
      bounds = 'a.due_date BETWEEN $1 AND $2';
      dates = [new Date(now.getTime() + 300000), new Date(now.getTime() + 86400000)];
    } else {
      bounds = 'a.due_date < $1';
      dates = [now];
    }
    const result = await pool.query(
      `SELECT a.*, u.email, u.name AS user_name
       FROM activities a JOIN users u ON a.user_id = u.id
       WHERE a.status != 'completado' AND ${bounds}
       AND NOT EXISTS (
         SELECT 1 FROM notifications n WHERE n.activity_id = a.id
         AND n.type = '${type}'
         AND n.sent_at > CURRENT_TIMESTAMP - INTERVAL '${schedule.interval}'
       )`, dates
    );
    for (const activity of result.rows) {
      const message = type === 'imminent'
        ? `🚨 ¡URGENTE! Tu actividad "${activity.title}" vence pronto`
        : type === 'overdue'
          ? `⚠️ Tu actividad "${activity.title}" está vencida`
          : `Tu actividad "${activity.title}" vence en menos de 24 horas`;
      // Guardar y emitir el aviso antes de contactar al proveedor de correo.
      const notification = await exports.createNotification(activity.user_id, activity.id, type, message);
      io?.to(`user_${activity.user_id}`).emit('new_notification', {
        ...notification, urgent: schedule.urgent, playSound: schedule.urgent
      });
      if (type !== 'overdue') await deliver(notification, activity);
    }
    if (type === 'imminent') await pendingEmails();
    return result.rows.length;
  });
}
exports.processImminentActivities = io => processActivities('imminent', io);
exports.processReminders = io => processActivities('email_24h', io);
exports.processOverdueActivities = io => processActivities('overdue', io);
exports.processPendingEmails = () => exclusive(pendingEmails);
