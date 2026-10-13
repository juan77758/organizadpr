# 📋 Sistema Organizador de Actividades con Notificaciones

Para publicar la aplicación con Vercel, Render y PostgreSQL, consulta [DEPLOYMENT.md](DEPLOYMENT.md). El backend usa PostgreSQL cuando se configura `DATABASE_URL`; la base en memoria queda disponible solo para desarrollo local.

MVP de un tablero Kanban para organizar actividades con sistema de alertas por email y notificaciones en tiempo real.

## 🎨 Características

- ✅ Tablero Kanban con drag & drop
- ✅ Notificaciones por email (Gmail)
- ✅ Notificaciones en tiempo real (Socket.io)
- ✅ Alertas sonoras en el navegador
- ✅ Sistema de prioridades (Alta/Media/Baja)
- ✅ Calendario de actividades
- ✅ Diseño en negro y dorado

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express
- PostgreSQL (actualmente mock in-memory)
- JWT para autenticación
- Nodemailer para emails
- Socket.io para WebSocket
- Node-cron para tareas programadas

### Frontend
- React + Vite
- React Router DOM
- Axios para HTTP
- Socket.io-client
- React Beautiful DnD (drag & drop)
- React Calendar
- React Toastify

## 📁 Estructura del Proyecto

```
organizador-actividades/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth y manejo de errores
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Email, notificaciones, cron
│   │   ├── utils/          # JWT, Socket handlers
│   │   ├── app.js          # Configuración de Express
│   │   └── server.js       # Punto de entrada
│   ├── .env                # Variables de entorno
│   └── package.json
│
└── frontend/               # Aplicación React
    ├── src/
    │   ├── components/     # Componentes reutilizables
    │   ├── pages/          # Páginas principales
    │   ├── services/       # API y servicios
    │   ├── context/        # Context API (Auth)
    │   ├── utils/          # Utilidades (sonidos)
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env                # Variables de entorno
    └── package.json
```

## ⚙️ Configuración

### 1. Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=organizador_actividades
JWT_SECRET=tu_secret_key_aqui
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
CLIENT_URL=http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:5002/api
VITE_SOCKET_URL=http://localhost:5002
```

## 🚀 Iniciar el Proyecto

### Backend
```bash
cd backend
npm run dev
```
Servidor corriendo en: http://localhost:5002

### Frontend
```bash
cd frontend
npm run dev
```
Aplicación corriendo en: http://localhost:3000

## ⚠️ Problemas Conocidos

### 1. Timezone de notificaciones
- **Estado:** Corrección implementada pero no verificada
- **Problema:** Desfase de 6 horas entre hora local (UTC-6) y UTC
- **Solución:** Conversión implementada en `backend/src/controllers/activityController.js`
- **Pendiente:** Verificar funcionamiento y hacer timezone dinámico

### 2. Base de datos in-memory
- Los datos se pierden al reiniciar el servidor
- **Pendiente:** Migrar a PostgreSQL real

### 3. Puertos ocupados
Si el servidor no inicia por puerto ocupado:

**Windows:**
```bash
# Encontrar proceso
netstat -ano | findstr :5002

# Matar proceso
taskkill /PID <PID> /F
```

## 📚 Documentación Completa

Para información detallada sobre el proyecto, arquitectura, problemas conocidos y tareas pendientes, consulta:

- [PROMPT_CONTINUACION_DESARROLLO.md](frontend/PROMPT_CONTINUACION_DESARROLLO.md) - Documentación completa para continuar el desarrollo

## 🎨 Paleta de Colores

- **Negro:** #000000, #1a1a1a, #2a2a2a, #3a3a3a
- **Dorado:** #d4af37 (primary), #b8941f (dark), #f0d678 (light)
- **Estados:** 
  - Rojo #ff4444 (alta prioridad/vencido)
  - Amarillo #ffbb33 (media prioridad/urgente)
  - Verde #00C851 (baja prioridad/completado)

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

### Actividades
- `GET /api/activities` - Listar actividades
- `POST /api/activities` - Crear actividad
- `GET /api/activities/:id` - Obtener actividad
- `PUT /api/activities/:id` - Actualizar actividad
- `DELETE /api/activities/:id` - Eliminar actividad

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/unread-count` - Contador no leídas
- `PATCH /api/notifications/:id/read` - Marcar como leída
- `PATCH /api/notifications/read-all` - Marcar todas como leídas

## 🔧 Tareas Pendientes

- [ ] Verificar corrección de timezone
- [ ] Implementar detección automática de timezone
- [ ] Migrar a PostgreSQL real
- [ ] Optimizar frecuencia de cron jobs
- [ ] Agregar tests unitarios
- [ ] Implementar notificaciones del navegador
- [ ] Agregar función de snooze en notificaciones

## 📄 Licencia

Proyecto MVP - Uso educativo y de demostración
