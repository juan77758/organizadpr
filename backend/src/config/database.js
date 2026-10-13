require('dotenv').config();
const { Pool } = require('pg');
const fs = require('node:fs');

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL es obligatorio en producción');
  }
  module.exports = require('./memoryDatabase');
} else {
  const url = new URL(process.env.DATABASE_URL);
  const mode = url.searchParams.get('sslmode');
  if (mode && !['disable', 'require', 'verify-ca', 'verify-full'].includes(mode)) {
    throw new Error('sslmode no soportado; usa verify-full o disable en una red privada');
  }
  // Evitar que parámetros de pg sustituyan la verificación TLS configurada.
  for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(name);
  if (process.env.DB_SSL !== undefined && !['true', 'false'].includes(process.env.DB_SSL)) {
    throw new Error('DB_SSL debe ser true o false');
  }
  const sslEnabled = process.env.DB_SSL !== undefined
    ? process.env.DB_SSL === 'true'
    : mode ? mode !== 'disable' : process.env.NODE_ENV === 'production';
  const pool = new Pool({
    connectionString: url.toString(),
    ssl: sslEnabled ? {
      rejectUnauthorized: true,
      ...(process.env.DB_SSL_CA_FILE ? { ca: fs.readFileSync(process.env.DB_SSL_CA_FILE, 'utf8') } : {})
    } : false,
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  });
  pool.on('error', () => console.error('La conexión PostgreSQL quedó interrumpida'));
  module.exports = pool;
}
