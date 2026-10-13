require('dotenv').config();
const production = process.env.NODE_ENV === 'production';
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

function validateRuntime() {
  if (!process.env.JWT_SECRET || (production && process.env.JWT_SECRET.length < 32)) {
    throw new Error('Configura JWT_SECRET; en producción necesita al menos 32 caracteres');
  }
  if (production) {
    for (const name of ['DATABASE_URL', 'FRONTEND_URL', 'APP_URL', 'EMAIL_FROM']) {
      if (!process.env[name]) throw new Error(`${name} es obligatorio en producción`);
    }
    for (const name of ['FRONTEND_URL', 'APP_URL']) {
      const url = new URL(process.env[name]);
      if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)) {
        throw new Error(`${name} debe apuntar al dominio HTTPS publicado`);
      }
    }
    if (!process.env.RESEND_API_KEY && !(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)) {
      throw new Error('Configura RESEND_API_KEY o las credenciales SMTP');
    }
  }
}

module.exports = { production, frontendUrl, validateRuntime };
