const nodemailer = require('nodemailer');

// Configurar transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Template de email para recordatorio
const getEmailTemplate = (activity, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #1a1a1a;
          color: #ffffff;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #2a2a2a;
          border: 2px solid #d4af37;
          border-radius: 10px;
          padding: 30px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #d4af37;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #d4af37;
          margin: 0;
        }
        .activity-card {
          background-color: #1a1a1a;
          border: 1px solid #d4af37;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .activity-title {
          color: #d4af37;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .activity-detail {
          margin: 10px 0;
          color: #cccccc;
        }
        .priority-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .priority-alta {
          background-color: #ff4444;
          color: white;
        }
        .priority-media {
          background-color: #ffbb33;
          color: black;
        }
        .priority-baja {
          background-color: #00C851;
          color: white;
        }
        .btn {
          display: inline-block;
          background-color: #d4af37;
          color: #1a1a1a;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #d4af37;
          color: #888888;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Recordatorio de Actividad</h1>
        </div>

        <p>Hola ${userName || 'Usuario'},</p>
        <p>Te recordamos que tienes una actividad próxima a vencer:</p>

        <div class="activity-card">
          <div class="activity-title">${activity.title}</div>
          ${activity.description ? `<div class="activity-detail"><strong>Descripción:</strong> ${activity.description}</div>` : ''}
          <div class="activity-detail">
            <strong>Fecha de vencimiento:</strong> ${new Date(activity.due_date).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </div>
          <div class="activity-detail">
            <strong>Prioridad:</strong>
            <span class="priority-badge priority-${activity.priority}">${activity.priority}</span>
          </div>
          ${activity.category ? `<div class="activity-detail"><strong>Categoría:</strong> ${activity.category}</div>` : ''}
        </div>

        <center>
          <a href="${process.env.APP_URL}" class="btn">Ver en la Aplicación</a>
        </center>

        <div class="footer">
          <p>Este es un correo automático del Sistema Organizador de Actividades</p>
          <p>No respondas a este correo</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Enviar email de recordatorio
exports.sendReminderEmail = async (userEmail, userName, activity) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `🔔 Recordatorio: ${activity.title}`,
      html: getEmailTemplate(activity, userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

// Verificar configuración de email
exports.verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✓ Configuración de email verificada');
    return true;
  } catch (error) {
    console.error('✗ Error en configuración de email:', error.message);
    return false;
  }
};
