# ⚡ Quick Start - Organizador de Actividades

Guía rápida para desarrolladores que ya tienen el entorno configurado.

## 📋 Requisitos Previos

✅ Node.js 16+  
✅ PostgreSQL 12+  
✅ npm o yarn  
✅ Cuenta Gmail con contraseña de aplicación

## 🚀 Instalación en 5 Minutos

### 1. Crear Base de Datos
```bash
createdb organizador_db
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run init-db
npm run dev
```

### 3. Frontend (nueva terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Abrir Navegador
```
http://localhost:3000
```

## 🔑 Configuración Mínima (.env)

### Backend
```env
DB_NAME=organizador_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=cualquier_cadena_secreta
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=contraseña-app-gmail
```

### Frontend
Ya viene configurado por defecto.

## 🎯 Probar Funcionalidades

1. **Registro**: Crear cuenta en `/register`
2. **Crear actividad**: Botón "+ Nueva Actividad"
3. **Drag & Drop**: Arrastrar tarjeta entre columnas
4. **Notificaciones**: Click en la campana 🔔
5. **Calendario**: Ir a pestaña "Calendario"

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/activities` | Listar actividades |
| POST | `/api/activities` | Crear actividad |
| PATCH | `/api/activities/:id/status` | Cambiar estado |
| DELETE | `/api/activities/:id` | Eliminar |
| GET | `/api/notifications` | Notificaciones |

## 🐛 Troubleshooting Rápido

**Backend no inicia:**
```bash
# Verificar PostgreSQL
psql -U postgres -d organizador_db
```

**Frontend no conecta:**
```bash
# Verificar que backend esté en puerto 5000
curl http://localhost:5000/health
```

**Emails no funcionan:**
- Usar contraseña de aplicación de Gmail (16 dígitos)
- No es la contraseña normal de Gmail

## 📦 Scripts Útiles

```bash
# Backend
npm run dev      # Modo desarrollo
npm start        # Producción
npm run init-db  # Crear tablas

# Frontend
npm run dev      # Desarrollo (puerto 3000)
npm run build    # Compilar
npm run preview  # Vista previa
```

## 🎨 Paleta de Colores

- **Negro**: `#000000`, `#1a1a1a`, `#2a2a2a`
- **Dorado**: `#d4af37`
- **Alta prioridad**: `#ff4444` (rojo)
- **Media prioridad**: `#ffbb33` (amarillo)
- **Baja prioridad**: `#00C851` (verde)

## 🔒 Autenticación

El frontend guarda en localStorage:
- `token`: JWT
- `user`: {id, email, name}

Todas las rutas protegidas requieren header:
```
Authorization: Bearer <token>
```

## 🌐 URLs por Defecto

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **WebSocket**: ws://localhost:5000

## 📂 Estructura de Archivos Principal

```
organizador-actividades/
├── backend/
│   ├── src/
│   │   ├── server.js           # Entry point
│   │   ├── app.js              # Express config
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # API routes
│   │   ├── services/           # Email, cron, notifications
│   │   └── socket/             # WebSocket
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx             # Router
    │   ├── components/         # React components
    │   ├── services/           # API clients
    │   └── contexts/           # React contexts
    └── package.json
```

## ✨ Características Implementadas

✅ Autenticación JWT  
✅ Tablero Kanban con drag & drop  
✅ CRUD de actividades  
✅ Filtros (prioridad, categoría, búsqueda)  
✅ Notificaciones en tiempo real (WebSocket)  
✅ Emails automáticos (24h antes del vencimiento)  
✅ Vista de calendario  
✅ Indicadores de urgencia  
✅ Diseño responsivo  
✅ Paleta negro y dorado  

## 📚 Más Información

- **README.md**: Documentación completa
- **INSTALL.md**: Guía detallada paso a paso
- **ESTRUCTURA_PROYECTO.md**: Arquitectura del código

---

**¿Todo funcionando?** ¡Empieza a crear actividades! 🎉
