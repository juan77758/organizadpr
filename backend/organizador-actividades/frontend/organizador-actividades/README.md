# 📋 Sistema Organizador de Actividades

Aplicación web full-stack para gestionar actividades mediante un tablero Kanban con sistema de notificaciones multicanal (email + in-app).

## 🎨 Características

- **Tablero Kanban** con drag & drop (Pendiente, En Proceso, Completado)
- **Notificaciones por email** (24h antes, día del vencimiento)
- **Notificaciones en tiempo real** vía WebSocket
- **Vista de calendario** mensual con actividades
- **Filtros avanzados** por prioridad, categoría y búsqueda
- **Autenticación segura** con JWT
- **Diseño responsivo** en paleta negro y dorado

## 🚀 Tecnologías

### Backend
- Node.js + Express
- PostgreSQL
- Socket.io (WebSockets)
- Nodemailer (emails)
- JWT + bcrypt
- node-cron (tareas programadas)

### Frontend
- React 18 + Vite
- React Router v6
- React Beautiful DnD (drag & drop)
- Socket.io-client
- React Calendar
- React Toastify
- date-fns

## 📦 Instalación

### Prerrequisitos

- Node.js 16+ y npm
- PostgreSQL 12+
- Cuenta de email (Gmail recomendado)

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd organizador-actividades
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# IMPORTANTE: Configurar DB_* y EMAIL_*

# Crear base de datos en PostgreSQL
createdb organizador_db

# Inicializar tablas
npm run init-db

# Iniciar servidor
npm run dev
```

El backend correrá en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar aplicación
npm run dev
```

El frontend correrá en `http://localhost:3000`

## ⚙️ Configuración de Email

Para Gmail:
1. Activar verificación en 2 pasos
2. Generar contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Usar esa contraseña en `EMAIL_PASSWORD`

Variables en `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
```

## 🗂️ Estructura del Proyecto

```
organizador-actividades/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de DB
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth y validación
│   │   ├── models/         # (Opcional: modelos)
│   │   ├── routes/         # Rutas de API
│   │   ├── services/       # Email, notificaciones, cron
│   │   ├── socket/         # WebSocket handlers
│   │   ├── utils/          # JWT y helpers
│   │   ├── app.js          # Configuración de Express
│   │   └── server.js       # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Auth/       # Login, Register
│   │   │   ├── Board/      # Kanban, Cards, Filters
│   │   │   ├── Activity/   # Modal de actividad
│   │   │   ├── Notifications/  # Centro de notificaciones
│   │   │   └── Layout/     # Navbar
│   │   ├── contexts/       # AuthContext
│   │   ├── services/       # API, Socket, Auth services
│   │   ├── pages/          # Dashboard, Calendar
│   │   ├── App.jsx         # Rutas principales
│   │   ├── main.jsx        # Punto de entrada
│   │   └── index.css       # Estilos globales
│   └── package.json
└── README.md
```

## 📱 Uso

1. **Registrarse**: Crear cuenta con email y contraseña
2. **Crear actividades**: Botón "+ Nueva Actividad"
3. **Arrastrar tarjetas**: Entre columnas para cambiar estado
4. **Filtrar**: Por prioridad, categoría o búsqueda de texto
5. **Ver calendario**: Pestaña "Calendario" para vista mensual
6. **Notificaciones**: Campana en navbar para ver alertas

## 🔐 Endpoints de API

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Actividades
- `GET /api/activities` - Listar (con filtros opcionales)
- `POST /api/activities` - Crear
- `GET /api/activities/:id` - Ver una
- `PUT /api/activities/:id` - Actualizar
- `PATCH /api/activities/:id/status` - Cambiar estado
- `DELETE /api/activities/:id` - Eliminar

### Notificaciones
- `GET /api/notifications` - Listar
- `GET /api/notifications/unread-count` - Contador
- `PATCH /api/notifications/:id/read` - Marcar leída
- `PATCH /api/notifications/read-all` - Marcar todas
- `DELETE /api/notifications/:id` - Eliminar

## ⏰ Tareas Programadas

El backend ejecuta automáticamente:
- **Cada hora**: Busca actividades que vencen en 24h y envía emails
- **Cada 6 horas**: Busca actividades vencidas y notifica

## 🎨 Paleta de Colores

- **Negro**: `#000000`, `#1a1a1a`, `#2a2a2a`
- **Dorado**: `#d4af37`, `#b8941f`, `#f0d678`
- **Estados**: Rojo (vencido), Amarillo (urgente), Verde (completado)

## 🛠️ Scripts Disponibles

### Backend
```bash
npm start        # Producción
npm run dev      # Desarrollo (nodemon)
npm run init-db  # Crear tablas
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de build
```

## 🚢 Deployment

### Backend
Recomendado: Railway, Render o Heroku
- Configurar variables de entorno
- Conectar a PostgreSQL en la nube (Railway, Supabase, Neon)

### Frontend
Recomendado: Vercel o Netlify
- Configurar `VITE_API_URL` con la URL de producción del backend
- Deploy automático desde Git

## 📝 Variables de Entorno

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=organizador_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté corriendo
- Comprobar credenciales en `.env`
- Crear la base de datos si no existe

### Emails no se envían
- Verificar credenciales de email
- Gmail: usar contraseña de aplicación, no la contraseña normal
- Revisar logs del backend

### WebSocket no conecta
- Verificar que el backend esté corriendo
- Comprobar CORS configurado correctamente
- Verificar token JWT válido

## 📄 Licencia

MIT

## 👨‍💻 Autor

Desarrollado como MVP del Sistema Organizador de Actividades
