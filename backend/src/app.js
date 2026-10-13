const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const pool = require('./config/database');
const { production, frontendUrl } = require('./config/runtime');

const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const testRoutes = require('./routes/testRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Render expone el servidor detrás de un proxy.
if (production) app.set('trust proxy', 1);
app.use(helmet());
// Middleware
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT id FROM users LIMIT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ error: 'Base de datos no disponible' });
  }
});

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, limit: 50,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' }
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
if (!production) app.use('/api/test', testRoutes);

// Manejo de errores
app.use(errorHandler);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
