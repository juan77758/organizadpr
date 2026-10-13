const cron = require('node-cron');
const { processReminders, processOverdueActivities } = require('./notificationService');

let io = null;

// Configurar tareas programadas
exports.setupCronJobs = (socketIo) => {
  io = socketIo;

  // Ejecutar cada hora para buscar actividades que vencen en 24 horas
  cron.schedule('0 * * * *', () => {
    console.log('🕐 Ejecutando tarea: Revisar recordatorios 24h');
    processReminders(io);
  });

  // Ejecutar cada 6 horas para buscar actividades vencidas
  cron.schedule('0 */6 * * *', () => {
    console.log('🕐 Ejecutando tarea: Revisar actividades vencidas');
    processOverdueActivities(io);
  });

  console.log('✓ Tareas cron configuradas');
};
