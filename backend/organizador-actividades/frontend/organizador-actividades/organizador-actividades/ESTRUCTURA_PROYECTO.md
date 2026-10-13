# 📂 Estructura Completa del Proyecto

```
organizador-actividades/
│
├── README.md                          # Documentación principal
├── INSTALL.md                         # Guía de instalación paso a paso
├── PROMPT_DESARROLLO_MVP.md           # Prompt original del proyecto
│
├── backend/                           # Servidor Node.js + Express
│   ├── .env.example                   # Plantilla de variables de entorno
│   ├── .gitignore
│   ├── package.json                   # Dependencias del backend
│   ├── README.md
│   │
│   └── src/
│       ├── server.js                  # Punto de entrada principal
│       ├── app.js                     # Configuración de Express
│       │
│       ├── config/
│       │   ├── database.js            # Conexión a PostgreSQL
│       │   └── initDatabase.js        # Script para crear tablas
│       │
│       ├── controllers/
│       │   ├── authController.js      # Login, Register, Me
│       │   ├── activityController.js  # CRUD de actividades
│       │   └── notificationController.js  # Gestión de notificaciones
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js      # Verificación de JWT
│       │   └── errorHandler.js        # Manejo global de errores
│       │
│       ├── routes/
│       │   ├── authRoutes.js          # Rutas de autenticación
│       │   ├── activityRoutes.js      # Rutas de actividades
│       │   └── notificationRoutes.js  # Rutas de notificaciones
│       │
│       ├── services/
│       │   ├── emailService.js        # Envío de emails con Nodemailer
│       │   ├── notificationService.js # Lógica de notificaciones
│       │   └── cronService.js         # Tareas programadas
│       │
│       ├── socket/
│       │   └── socketHandlers.js      # WebSocket handlers
│       │
│       └── utils/
│           └── jwt.js                 # Generar y verificar tokens
│
└── frontend/                          # Aplicación React + Vite
    ├── .env.example                   # Plantilla de variables de entorno
    ├── .gitignore
    ├── package.json                   # Dependencias del frontend
    ├── vite.config.js                 # Configuración de Vite
    ├── index.html                     # HTML principal
    ├── README.md
    │
    └── src/
        ├── main.jsx                   # Punto de entrada de React
        ├── App.jsx                    # Router y rutas principales
        ├── index.css                  # Estilos globales (paleta negro/dorado)
        │
        ├── components/
        │   │
        │   ├── Auth/
        │   │   ├── Login.jsx          # Pantalla de login
        │   │   ├── Register.jsx       # Pantalla de registro
        │   │   └── Auth.css           # Estilos de autenticación
        │   │
        │   ├── Board/
        │   │   ├── KanbanBoard.jsx    # Tablero principal con drag & drop
        │   │   ├── ActivityCard.jsx   # Tarjeta de actividad
        │   │   ├── Filters.jsx        # Barra de filtros
        │   │   └── Board.css          # Estilos del tablero
        │   │
        │   ├── Activity/
        │   │   ├── ActivityModal.jsx  # Modal crear/editar actividad
        │   │   └── Activity.css       # Estilos del modal
        │   │
        │   ├── Notifications/
        │   │   ├── NotificationCenter.jsx  # Panel de notificaciones
        │   │   └── Notifications.css       # Estilos de notificaciones
        │   │
        │   └── Layout/
        │       ├── Navbar.jsx         # Barra de navegación superior
        │       └── Layout.css         # Estilos del navbar
        │
        ├── contexts/
        │   └── AuthContext.jsx        # Context de autenticación
        │
        ├── services/
        │   ├── api.js                 # Cliente Axios configurado
        │   ├── authService.js         # Servicios de autenticación
        │   ├── activityService.js     # Servicios de actividades
        │   ├── notificationService.js # Servicios de notificaciones
        │   └── socketService.js       # Cliente Socket.io
        │
        └── pages/
            ├── Dashboard.jsx          # Página del dashboard (tablero)
            ├── CalendarPage.jsx       # Página del calendario
            └── CalendarPage.css       # Estilos del calendario
```

## 🎯 Archivos Clave

### Backend
- **server.js**: Inicializa el servidor HTTP y WebSocket
- **app.js**: Configura Express, CORS y rutas
- **authController.js**: Lógica de registro y login
- **activityController.js**: CRUD completo de actividades
- **emailService.js**: Envío de emails con templates HTML
- **cronService.js**: Tareas automáticas (cada hora y cada 6h)
- **socketHandlers.js**: Manejo de conexiones WebSocket

### Frontend
- **App.jsx**: Configuración de rutas (React Router)
- **AuthContext.jsx**: Estado global de autenticación
- **KanbanBoard.jsx**: Tablero con drag & drop (react-beautiful-dnd)
- **ActivityCard.jsx**: Tarjeta de actividad con indicadores
- **NotificationCenter.jsx**: Panel de notificaciones con tiempo real
- **CalendarPage.jsx**: Vista de calendario con react-calendar

## 📊 Flujo de Datos

### Crear Actividad
1. Usuario llena formulario en ActivityModal
2. Frontend → POST /api/activities
3. Backend guarda en PostgreSQL
4. Backend responde con actividad creada
5. Frontend actualiza estado y cierra modal

### Drag & Drop
1. Usuario arrastra tarjeta a otra columna
2. Frontend actualiza UI optimísticamente
3. Frontend → PATCH /api/activities/:id/status
4. Backend actualiza estado en BD
5. Si hay error, frontend revierte cambio

### Notificaciones en Tiempo Real
1. Backend cron job detecta actividad próxima a vencer
2. Backend crea notificación en BD
3. Backend emite evento Socket.io a sala del usuario
4. Frontend recibe evento y actualiza contador
5. Usuario abre panel y ve notificación

### Emails Automáticos
1. Cron job ejecuta cada hora
2. Busca actividades que vencen en 24h
3. Envía email con Nodemailer
4. Guarda registro en tabla de notificaciones

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación con JWT (Bearer token)
- Middleware de autenticación en rutas protegidas
- Validación de datos en backend
- CORS configurado para frontend específico
- WebSocket con autenticación por token

## 🎨 Diseño

**Paleta de Colores:**
- Negro: #000000, #1a1a1a, #2a2a2a, #3a3a3a
- Dorado: #d4af37 (principal), #b8941f (oscuro), #f0d678 (claro)
- Estados: Rojo (#ff4444), Amarillo (#ffbb33), Verde (#00C851)

**Tipografía:**
- Sistema: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

**Animaciones:**
- fadeIn (entrada de modales y cards)
- slideIn (panel de notificaciones)
- loading (skeleton loader)
- spin (spinner de carga)

## 📦 Dependencias Principales

### Backend
```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "socket.io": "^4.7.2",
  "nodemailer": "^6.9.7",
  "node-cron": "^3.0.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "react-beautiful-dnd": "^13.1.1",
  "socket.io-client": "^4.7.2",
  "react-calendar": "^4.8.0",
  "react-toastify": "^9.1.3",
  "axios": "^1.6.2",
  "date-fns": "^3.0.6"
}
```

## 🔄 Estado de la Aplicación

### LocalStorage
- `token`: JWT para autenticación
- `user`: Datos básicos del usuario (id, email, name)

### React State (Global)
- AuthContext: user, loading, isAuthenticated, login, register, logout

### React State (Local)
- KanbanBoard: activities, filteredActivities, filters
- NotificationCenter: notifications, loading
- CalendarPage: activities, selectedDate, selectedActivities

---

**Total de archivos:** ~50 archivos principales
**Líneas de código:** ~5000 líneas aproximadamente
**Tiempo de desarrollo:** 8-12 semanas (1 desarrollador)
