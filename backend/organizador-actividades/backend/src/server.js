const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { verifyEmailConfig } = require('./services/emailService');
const { setupCronJobs } = require('./services/cronService');
const setupSocketHandlers = require('./socket/socketHandlers');

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Configurar manejadores de Socket
setupSocketHandlers(io);

// Configurar tareas cron
setupCronJobs(io);

// Iniciar servidor
server.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket habilitado`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Verificar configuración de email
  await verifyEmailConfig();
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});
