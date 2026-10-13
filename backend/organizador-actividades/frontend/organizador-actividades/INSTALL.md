# 🚀 Guía de Instalación Completa

## Paso 1: Requisitos Previos

### Windows
1. Instalar Node.js desde: https://nodejs.org/ (versión LTS)
2. Instalar PostgreSQL desde: https://www.postgresql.org/download/windows/
3. Durante la instalación de PostgreSQL, anotar la contraseña del usuario `postgres`

### Verificar instalación
```bash
node --version  # Debe mostrar v16 o superior
npm --version
psql --version  # PostgreSQL 12 o superior
```

## Paso 2: Configurar Base de Datos

### Opción A: Usando psql (línea de comandos)
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE organizador_db;

# Salir
\q
```

### Opción B: Usando pgAdmin
1. Abrir pgAdmin
2. Click derecho en "Databases" → "Create" → "Database"
3. Nombre: `organizador_db`
4. Click "Save"

## Paso 3: Configurar Email (Gmail)

1. Ir a https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (activar)
3. Contraseñas de aplicación → Seleccionar "Correo" y "Computadora con Windows"
4. Copiar la contraseña generada (16 caracteres)

## Paso 4: Instalar Backend

```bash
# Navegar a la carpeta del backend
cd organizador-actividades/backend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
copy .env.example .env

# Editar .env con tus credenciales
notepad .env
```

### Configurar .env del Backend
Reemplazar los valores:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=organizador_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_POSTGRESQL

JWT_SECRET=mi_clave_super_secreta_cambiar_en_produccion
JWT_EXPIRES_IN=7d

EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=CONTRASEÑA_DE_16_DIGITOS_DE_GMAIL
EMAIL_FROM=Sistema Organizador <noreply@organizador.com>

FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Inicializar Base de Datos
```bash
npm run init-db
```

Deberías ver: "✓ Tablas creadas exitosamente"

### Iniciar Backend
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 5000
✓ Conectado a PostgreSQL
✓ Configuración de email verificada
```

## Paso 5: Instalar Frontend

**Abrir una NUEVA terminal** (dejar el backend corriendo)

```bash
# Navegar a la carpeta del frontend
cd organizador-actividades/frontend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
copy .env.example .env
```

El archivo `.env` del frontend puede quedarse con los valores por defecto.

### Iniciar Frontend
```bash
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

## Paso 6: Probar la Aplicación

1. Abrir navegador en `http://localhost:3000`
2. Hacer click en "Regístrate aquí"
3. Crear cuenta con tu email
4. Deberías ser redirigido al Dashboard
5. Crear una actividad de prueba

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED" al conectar a PostgreSQL
- Verificar que PostgreSQL esté corriendo (Services de Windows)
- Comprobar contraseña en `.env`
- Probar conexión: `psql -U postgres -d organizador_db`

### Error: "Cannot connect to server"
- Verificar que el backend esté corriendo en otra terminal
- Comprobar que el puerto 5000 no esté ocupado

### Emails no se envían
- Usar contraseña de aplicación de Gmail, NO la contraseña normal
- Verificar que la verificación en 2 pasos esté activada
- Revisar logs del backend para más detalles

### Error: "Module not found"
- Eliminar `node_modules` y ejecutar `npm install` de nuevo
- Verificar que estés en la carpeta correcta

### Puerto 3000 ya en uso
```bash
# Matar proceso en el puerto (Windows)
netstat -ano | findstr :3000
taskkill /PID <numero-del-pid> /F

# O cambiar el puerto en vite.config.js
```

## ✅ Checklist de Verificación

- [ ] Node.js instalado (v16+)
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `organizador_db` creada
- [ ] Backend `.env` configurado con credenciales correctas
- [ ] `npm install` ejecutado en backend y frontend
- [ ] `npm run init-db` ejecutado sin errores
- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 3000
- [ ] Puedes registrarte y crear actividades

## 🎉 ¡Listo!

Tu aplicación debería estar corriendo. Características disponibles:

✨ Tablero Kanban con drag & drop
✨ Crear, editar y eliminar actividades
✨ Filtros por prioridad y categoría
✨ Vista de calendario
✨ Notificaciones en tiempo real
✨ Emails de recordatorio automáticos

---

**¿Necesitas ayuda?** Revisa los logs del backend y frontend para más detalles sobre cualquier error.
