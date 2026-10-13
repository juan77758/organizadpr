# Publicar el organizador para varios usuarios

Preparación incluida: frontend para Vercel, servidor permanente para Render, PostgreSQL persistente y recordatorios cada minuto. Este documento y los archivos de configuración no publican nada por sí solos.

## 1. Llevar los cambios a GitHub

Usa la carpeta principal del repositorio, que contiene `backend`, `frontend` y `render.yaml`. Conserva tus archivos `.env` solo en tu computadora. Incluye los dos `package-lock.json` en GitHub, pero nunca `.env`, contraseñas de Gmail o claves privadas. La contraseña de Gmail que apareció en el documento de contexto debe revocarse y reemplazarse.

Los cambios preparados en Codex deben sincronizarse con tu repositorio antes de importar el proyecto en los proveedores. El proyecto de tu computadora no se modifica automáticamente desde este chat.

## 2. Crear el frontend en Vercel

1. Importa el repositorio de GitHub.
2. En **Root Directory**, elige `frontend`. Framework: **Vite**. Se utiliza `frontend/vercel.json` para que las rutas `/dashboard`, `/calendar` y `/login` funcionen al recargar.
3. Configura estas variables para **Production** y, si vas a usarlas, para **Preview**:

   ```env
   VITE_API_URL=https://TU-BACKEND.onrender.com/api
   VITE_SOCKET_URL=https://TU-BACKEND.onrender.com
   ```

   Reemplaza el nombre por el dominio real del backend después del paso 3. Si todavía no lo tienes, termina la configuración de Render y vuelve aquí antes de considerar funcional el despliegue.
4. Anota el dominio estable de producción que Vercel asigna. Un frontend construido antes de configurar estas variables requiere un **Redeploy**: Vite las incorpora durante la compilación.

No pongas DATABASE_URL, JWT_SECRET, EMAIL_PASSWORD o RESEND_API_KEY en Vercel ni en variables `VITE_`. Todas las variables `VITE_` son públicas.

## 3. Crear el backend y PostgreSQL en Render

En Render elige **New → Blueprint** e importa el repositorio. Render lee `render.yaml` desde la raíz.

La plantilla propone **Web Service Starter** y **PostgreSQL Basic**: ambos tienen costo. Revisa el precio que muestre Render antes de crear recursos. Aquí no se ha contratado ningún servicio. Un backend que se duerme no puede garantizar los avisos por minuto; el plan gratuito también puede restringir SMTP.

Completa las variables que Render solicite:

| Variable | Qué poner |
| --- | --- |
| FRONTEND_URL | Dominio HTTPS estable de Vercel, sin `/` al final |
| APP_URL | El mismo dominio de Vercel |
| EMAIL_USER | Cuenta Gmail que envía los recordatorios |
| EMAIL_PASSWORD | NUEVA contraseña de aplicación de Gmail, introducida solo en Render |
| EMAIL_FROM | `Organizador <tu-cuenta@gmail.com>`; utiliza la misma cuenta remitente |

Render genera JWT_SECRET y enlaza DATABASE_URL al PostgreSQL del Blueprint. Guarda JWT_SECRET estable: cambiarlo invalida las sesiones. DB_SSL=false está previsto únicamente para la **URL interna** de Render y la misma región/red privada. Para una URL externa utiliza DB_SSL=true y el certificado CA oficial si lo requiere el proveedor. Nunca desactives la verificación del certificado de una conexión TLS.

El backend instala con `npm ci --omit=dev` y arranca con `npm start`. Al iniciar crea las tablas y actualiza los campos de envío pendientes sin borrar usuarios ni tareas. `/ready` comprueba que PostgreSQL responde; Render lo usa como health check. No ejecutes `init-db` contra una base ajena al proyecto.

Cuando aparezca la URL del backend, actualiza las dos variables de Vercel y vuelve a desplegar el frontend. Si cambia el dominio del frontend, actualiza FRONTEND_URL y APP_URL en Render. El origen autorizado es exacto; las URLs temporales de Preview de Vercel no se autorizan automáticamente.

### Alternativa de correo mediante HTTPS

Si el hosting impide SMTP o quieres un proveedor de correo transaccional, el backend también admite **Resend**:

1. Verifica un dominio remitente en Resend siguiendo su configuración DNS.
2. Añade RESEND_API_KEY como variable privada en Render.
3. Cambia EMAIL_FROM por un remitente de ese dominio verificado.

La clave de Resend tiene prioridad sobre Gmail SMTP. El destinatario puede seguir siendo cualquier Gmail; no necesita aportar su contraseña. El modo de prueba de Resend tiene restricciones de destinatarios y no equivale a un servicio listo para todos los usuarios.

## 4. Comprobar el despliegue

1. Comprueba que `/ready` en la URL del backend responde `{"status":"ready"}`.
2. Abre el frontend, registra dos cuentas con correos distintos y confirma que cada una ve solo sus actividades.
3. Crea una tarea para dentro de tres minutos. Mantén abierta la app y haz clic dentro de ella para activar el audio. El aviso se revisa cada minuto dentro de una ventana de cinco minutos antes y después del vencimiento; puede llegar antes de la hora seleccionada.
4. Confirma correo real, campana y alarma de tres secuencias. La app cerrada no reproduce sonidos; el backend encendido sí puede enviar el correo.
5. Cambia la tarea de columna, recarga y confirma que conserva su estado.
6. Reinicia/redeploya el backend y verifica que el usuario y la tarea siguen guardados. Al recuperar la sesión, abre la campana para ver los avisos guardados; no se garantiza reproducir sonidos de eventos que ocurrieron mientras la app estuvo desconectada.

En producción se ocultan los botones de prueba y sus endpoints manuales responden 404. Los correos fallidos se reintentan hasta cinco intentos en las primeras 24 horas, sin volver a emitir el aviso de la campana. Con Resend se envía una clave de idempotencia. Gmail SMTP no garantiza exactamente un envío si el proceso se interrumpe entre la aceptación del correo y su registro en PostgreSQL.

Revisa los límites de envío y las políticas de uso de Gmail. Para mayor volumen es preferible un proveedor transaccional con dominio verificado. Usa una sola instancia del backend con este Blueprint. Una ampliación a varias instancias también requiere adaptar Socket.IO para compartir las salas.

## Desarrollo local con PostgreSQL

Si tienes Docker:

```bash
docker compose up -d database
```

En `backend/.env` agrega:

```env
DATABASE_URL=postgresql://organizador:local-development-only@localhost:5432/organizador
DB_SSL=false
```

Esas credenciales son solo para el contenedor local. Conserva JWT_SECRET, el puerto y tus variables locales de correo. Desde `backend` ejecuta `npm ci` y `npm run dev` (en PowerShell, `npm.cmd ci` y `npm.cmd run dev`). Sin DATABASE_URL el desarrollo sigue usando memoria; producción exige PostgreSQL y no permite ese fallback. No existe una migración de datos guardados en memoria: tendrás que registrar de nuevo esas cuentas en PostgreSQL.

## Pruebas del repositorio

Instala dependencias en `backend` y `frontend` con `npm ci`. Desde la raíz:

```bash
npm test --prefix backend
npm run build --prefix frontend
```

Las dependencias se actualizaron y fijaron en los lockfiles; usa Node 24.

La prueba PostgreSQL se omite a menos que TEST_DATABASE_URL apunte a una **base aislada de pruebas**. Ejemplo con una base local dedicada:

```bash
TEST_DATABASE_URL=postgresql://usuario:password@localhost:5432/organizador_test npm test --prefix backend
```

Las pruebas de correo usan un proveedor simulado; no envían mensajes reales. La entrega pública se valida con el paso 4 después de configurar las cuentas.
