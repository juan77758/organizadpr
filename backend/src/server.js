const http = require('http');
const { Server } = require('socket.io');
const { frontendUrl, validateRuntime } = require('./config/runtime');
validateRuntime();
const app = require('./app');
const pool = require('./config/database');
const { verifyEmailConfig } = require('./services/emailService');
const { setupCronJobs } = require('./services/cronService');
const setupSocketHandlers = require('./socket/socketHandlers');
const { createTables } = require('./config/initDatabase');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: frontendUrl, credentials: true } });
setupSocketHandlers(io);
app.set('io', io);
let stopCron = () => {};

async function start() {
  if (process.env.DATABASE_URL) await createTables();
  stopCron = setupCronJobs(io);
  server.listen(process.env.PORT || 5002, '0.0.0.0', () => {
    console.log(`Servidor iniciado en puerto ${process.env.PORT || 5002}`);
    verifyEmailConfig();
  });
}

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  stopCron();
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  io.close(async () => {
    await pool.end?.();
    clearTimeout(timeout);
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
server.on('error', () => { console.error('No se pudo iniciar el servidor HTTP'); process.exit(1); });
start().catch(async () => {
  console.error('No se pudo preparar PostgreSQL; revisa DATABASE_URL y los logs de inicialización');
  await pool.end?.();
  process.exitCode = 1;
});
