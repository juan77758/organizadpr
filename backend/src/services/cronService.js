const cron = require('node-cron');
const notifications = require('./notificationService');

exports.setupCronJobs = io => {
  const run = async () => {
    try {
      await notifications.processImminentActivities(io);
      await notifications.processReminders(io);
      await notifications.processOverdueActivities(io);
    } catch (error) {
      console.error('No se pudieron procesar los recordatorios:', error.code || error.name);
    }
  };
  // Recuperar avisos pendientes al iniciar y revisar una vez por minuto.
  run();
  const job = cron.schedule('* * * * *', run, { timezone: 'UTC' });
  return () => job.stop();
};
