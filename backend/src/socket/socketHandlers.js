const { verifyToken } = require('../utils/jwt');

const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new Error('Token inválido'));
    }

    socket.userId = decoded.userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`✓ Usuario conectado: ${socket.userId}`);

    // Unir al usuario a su sala personal
    socket.join(`user_${socket.userId}`);

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`✗ Usuario desconectado: ${socket.userId}`);
    });

    // Solicitar notificaciones no leídas
    socket.on('request_unread_notifications', async () => {
      try {
        const pool = require('../config/database');
        const result = await pool.query(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
          [socket.userId]
        );
        socket.emit('unread_count', { count: parseInt(result.rows[0].count) });
      } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
      }
    });
  });

  return io;
};

module.exports = setupSocketHandlers;
