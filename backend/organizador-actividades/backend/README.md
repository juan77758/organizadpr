# Backend - Sistema Organizador de Actividades

Backend del sistema de gestión de actividades con notificaciones multicanal.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales

# Inicializar base de datos
npm run init-db

# Iniciar servidor en modo desarrollo
npm run dev
```

## 📋 Variables de Entorno

Configura las siguientes variables en `.env`:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Credenciales PostgreSQL
- `JWT_SECRET`: Clave secreta para tokens JWT
- `EMAIL_USER`, `EMAIL_PASSWORD`: Credenciales para envío de emails
- `FRONTEND_URL`: URL del frontend para CORS

## 🔧 Comandos

- `npm start`: Iniciar servidor en producción
- `npm run dev`: Iniciar en modo desarrollo con nodemon
- `npm run init-db`: Crear tablas en la base de datos

## 📡 Endpoints

### Autenticación
- `POST /api/auth/register`: Registro de usuario
- `POST /api/auth/login`: Inicio de sesión
- `GET /api/auth/me`: Usuario actual (requiere token)

### Actividades
- `GET /api/activities`: Listar actividades
- `POST /api/activities`: Crear actividad
- `GET /api/activities/:id`: Ver actividad
- `PUT /api/activities/:id`: Actualizar actividad
- `PATCH /api/activities/:id/status`: Cambiar estado
- `DELETE /api/activities/:id`: Eliminar actividad

### Notificaciones
- `GET /api/notifications`: Listar notificaciones
- `GET /api/notifications/unread-count`: Contador de no leídas
- `PATCH /api/notifications/:id/read`: Marcar como leída
- `PATCH /api/notifications/read-all`: Marcar todas como leídas
- `DELETE /api/notifications/:id`: Eliminar notificación

## 🔌 WebSocket

El servidor Socket.IO escucha en el mismo puerto. Eventos:

- `connection`: Conectar con token JWT en `auth.token`
- `new_notification`: Recibir nuevas notificaciones
- `request_unread_notifications`: Solicitar contador de no leídas

## ⏰ Tareas Programadas

- Cada hora: Revisar actividades que vencen en 24h
- Cada 6 horas: Revisar actividades vencidas
