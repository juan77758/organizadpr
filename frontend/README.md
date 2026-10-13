# Frontend - Organizador de Actividades

Aplicación React con tablero Kanban, notificaciones en tiempo real y calendario.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

Accede a `http://localhost:3000`

## 🏗️ Construcción

```bash
# Compilar para producción
npm run build

# Vista previa de build
npm run preview
```

## 📁 Estructura

```
src/
├── components/
│   ├── Auth/           # Login, Register
│   ├── Board/          # Kanban, Cards, Filters
│   ├── Activity/       # Modal crear/editar
│   ├── Notifications/  # Centro de notificaciones
│   └── Layout/         # Navbar
├── contexts/           # AuthContext
├── services/           # API clients
├── pages/              # Dashboard, Calendar
├── App.jsx             # Router y rutas
└── main.jsx            # Entry point
```

## 🎨 Estilos

Paleta negro y dorado con CSS Variables:
- `--color-black`, `--color-gold`
- Ver `src/index.css` para la paleta completa

## 🔌 Servicios

- **authService**: Login, register, logout
- **activityService**: CRUD de actividades
- **notificationService**: Gestión de notificaciones
- **socketService**: WebSocket para tiempo real
