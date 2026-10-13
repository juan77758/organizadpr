const cron = require('node-cron');
const { processReminders, processOverdueActivities, processImminentActivities } = require('./notificationService');

let io = null;

// Configurar tareas programadas
exports.setupCronJobs = (socketIo) => {
  io = socketIo;

  // Ejecutar cada minuto para buscar actividades que vencen en los próximos 5 minutos
  cron.schedule('* * * * *', () => {
    console.log('🔔 Revisando actividades inminentes...');
    processImminentActivities(io);
  });

  // Ejecutar cada hora para buscar actividades que vencen en 24 horas
  cron.schedule('0 * * * *', () => {
    console.log('🕐 Ejecutando tarea: Revisar recordatorios 24h');
    processReminders(io);
  });

  // Ejecutar cada hora para buscar actividades vencidas
  cron.schedule('0 * * * *', () => {
    console.log('🕐 Ejecutando tarea: Revisar actividades vencidas');
    processOverdueActivities(io);
  });

  console.log('✓ Tareas cron configuradas (cada minuto + cada hora)');
};
