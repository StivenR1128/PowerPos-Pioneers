# 08. Instalación, despliegue y operación

## Alcance de esta guía

Procedimiento basado en archivos y scripts existentes. En la revisión documental 1.1 se ejecutaron las migraciones y una restauración en bases temporales con datos sintéticos; no se desplegó el producto ni se aplicó seed sobre datos reales. Ver el [informe de validación](cliente/informe-validacion.md). Los comandos de desarrollo deben ejecutarse en un ambiente separado de datos de cliente.

## Requisitos y estructura

Node.js compatible con los manifests (el README indica 20+; la herramienta local inspeccionada reportó 24.19.0), npm, Docker con Compose y navegador. API y frontend tienen sus propios `package.json` y lockfiles; la raíz no tiene script de arranque conjunto y declara pnpm mediante devEngines. Los pasos siguientes usan npm desde cada subproyecto. Acordar un gestor y conservar sus lockfiles en el equipo.

Puertos locales: PostgreSQL 5432, Redis 6379, API 3000 y frontend 3001. Redis está en Compose, pero no se identificó consumo desde los servicios revisados.

## 1. Servicios locales

Desde la raíz del repositorio:

```powershell
docker compose up -d
docker compose ps
```

Compose crea volúmenes para PostgreSQL y Redis. La configuración incluida contiene credenciales de desarrollo; no reutilizarlas en el ambiente entregado a compradores.

## 2. Configuración de API

Crear `api/.env` local, sin confirmarlo en Git. Plantilla sin secretos reales:

```dotenv
DATABASE_URL="postgresql://USUARIO:CLAVE@localhost:5432/BASE?schema=public"
JWT_SECRET="REEMPLAZAR_POR_SECRETO_ALEATORIO_PROPIO"
APP_URL="http://localhost:3000"
ESC_POS_ENABLED="false"
ESC_POS_BROWSER_FALLBACK="true"
```

Reemplazar usuario, clave y base por los del servicio PostgreSQL utilizado. `APP_URL` construye URL de logos; no configura la URL Axios del frontend. El código tiene un secreto JWT de respaldo: la entrega debe exigir configurar uno propio.

| Variable | Finalidad | Necesidad |
| --- | --- | --- |
| DATABASE_URL | Conexión PostgreSQL | Obligatoria |
| JWT_SECRET | Firma y validación JWT | Obligatoria para entrega segura |
| APP_URL | URL pública de API para logos | Configurar según ambiente |
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS | Correo saliente | Opcional; puerto por defecto 587 |
| EMAIL_ADMIN, ADMIN_PHONE | Destinatarios de respaldo | Opcionales, revisar por empresa |
| TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN | Autenticación de proveedor | Opcionales |
| TWILIO_WHATSAPP_PHONE, TWILIO_SMS_PHONE, TWILIO_PHONE | Remitentes y respaldo de remitente | Opcionales |
| ESC_POS_ENABLED | Habilita impresión directa | true/false |
| ESC_POS_TYPE | Transporte de impresión | tcp por defecto |
| ESC_POS_HOST, ESC_POS_PORT | Dirección de impresora | Puerto por defecto 9100 |
| ESC_POS_BROWSER_FALLBACK | Alternativa del navegador | true/false |
| SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME | Aprovisionamiento por script | Solo cuando se use crear-superadmin |

No se observó uso de variable `PORT`: `main.ts` escucha en 3000. Las variables de integración no sustituyen la configuración o habilitación de cuentas externas.

## 3. Dependencias, esquema y arranque

En una terminal desde la raíz:

```powershell
cd api
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

`npm ci` requiere manifiesto y lockfile coherentes. Si falla, revisar la discrepancia con el equipo; no regenerar el lockfile como parte rutinaria de una entrega. Aplicar migraciones solo después de confirmar base destino y respaldo. Los cambios locales del esquema podrían requerir nuevas migraciones; `migrate deploy` aplica archivos existentes, no genera los faltantes.

Para cargar una demostración aislada, revisar previamente `api/prisma/seed.ts` y ejecutar `npm run seed` desde api. No aplicar seed de demostración sobre datos de cliente. Para crear el superadministrador, configurar las variables indicadas y ejecutar `npm run crear-superadmin`; el script puede actualizar una cuenta existente con ese correo, incluido su rol y contraseña.

## 4. Frontend

En otra terminal desde la raíz:

```powershell
cd web
npm ci
npm run dev -- --port 3001
```

Abrir `http://localhost:3001/login`. Se indica el puerto explícitamente porque `next dev` no fija 3001 en el script; así se evita colisión con la API.

## 5. Verificación local

Comprobar acceso al login, autenticación con cuenta de prueba, carga de catálogo, caja y una venta de prueba con control de stock y movimiento financiero. Probar cocina en otra ventana y detenerse ante cualquier inconsistencia. La ruta `/` de API devuelve el ejemplo Hello World; no es una comprobación completa de salud de base de datos.

Para revisar migraciones: `npx prisma migrate status` desde api. Para verificar compilación: `npm run build` en api y luego en web. Desde api, `npm test -- --runInBand` ejecuta pruebas unitarias; `npm run test:e2e -- --runInBand` requiere un ambiente aislado porque importa módulos y tareas del sistema. `npm run lint` de API usa `--fix` y puede modificar archivos.

## Preparación del despliegue

Antes de publicar una instancia para adquirentes, completar [brechas](11-brechas-y-evolucion.md) y registrar:

| Elemento | Dato o evidencia requerida |
| --- | --- |
| Alojamiento | Proveedor, responsable, región y recursos; por definir |
| URL | Dominio de web/API y HTTPS; por definir |
| Red del cliente | Acceso a impresora desde el proceso backend; un servidor remoto no alcanza automáticamente una impresora privada |
| URLs frontend | Sustituir referencias localhost en Axios, SSE y otras rutas; hoy no hay configuración central por ambiente |
| CORS | Restringir a orígenes autorizados; hoy usa `*` |
| Persistencia | Base de datos y uploads conservados entre versiones |
| Secretos | Credenciales propias, sin defaults ni cuentas demo |
| Hora | Zona horaria y horarios de cierre acordados y probados |
| Instancias | Considerar eventos en memoria y cron antes de aumentar réplicas |
| Aceptación | Pruebas críticas ejecutadas, incidencias documentadas y acta firmada |

Compilación prevista: `npm run build` en ambos proyectos; arranque de API mediante `npm run start:prod` y de web mediante `npm run start -- --port 3001`. Confirmar que la salida del build coincide con el script de arranque antes de instalar un servicio. No hay un procedimiento de CI/CD del proyecto acreditado por esta revisión.

## Respaldo y recuperación

Respaldar PostgreSQL y `api/uploads` de forma coordinada. El volumen Docker es persistencia, no una copia externa. La presencia de un SQL en `backups` no demuestra periodicidad ni recuperabilidad.

Ejemplo para el Compose local, desde raíz, sin redirigir binarios a través de PowerShell:

```powershell
New-Item -ItemType Directory -Force backups
docker exec powerpos_db pg_dump -U powerpos -d powerpos_dev -Fc -f /tmp/powerpos-respaldo.dump
docker cp powerpos_db:/tmp/powerpos-respaldo.dump backups/powerpos-respaldo.dump
```

Usar nombre único por fecha en operación para no sobrescribir versiones anteriores, proteger acceso al respaldo y copiarlo fuera del host. El dump puede contener datos personales y hashes de usuarios. Las credenciales de la instancia real pueden diferir del ejemplo.

La restauración debe probarse en **una base nueva y aislada**, no sobre la productiva. Ejemplo para un nombre de prueba que todavía no exista:

```powershell
docker cp backups/powerpos-respaldo.dump powerpos_db:/tmp/powerpos-restaurar.dump
docker exec powerpos_db createdb -U powerpos powerpos_restore_test
docker exec powerpos_db pg_restore -U powerpos -d powerpos_restore_test --no-owner /tmp/powerpos-restaurar.dump
```

Si la base de prueba ya existe, detenerse y elegir otra base; no borrarla automáticamente. Validar conteos, relaciones, login de prueba y lectura de pedidos usando una API aislada, con notificaciones y cron controlados. Registrar fecha, duración, responsable y resultado. La meta de respaldo diario y recuperación en cuatro horas es propuesta, no un compromiso contratado.

## Actualización y reversión

1. Registrar versión exacta, cambios, respaldo y ventana de mantenimiento.
2. Probar migraciones y compilación en ambiente aislado.
3. Aplicar versión y ejecutar pruebas de humo.
4. Si falla, detener nuevas escrituras y evaluar restauración con responsable. Revertir código no deshace automáticamente migraciones ni datos.
5. Registrar incidente, cambios de versión y comunicación acordada con cliente.

## Diagnóstico

| Síntoma | Revisar |
| --- | --- |
| Login falla | API, conexión DB, usuario/empresa activos, credenciales y JWT_SECRET |
| API inaccesible desde otro equipo | localhost del navegador apunta a ese equipo; revisar URL y red |
| POS bloqueado | Caja abierta, sucursal y cajero asignado |
| Caja se cierra sola | Cron cada cinco minutos, hora local y horario codificado |
| Cocina tarda | SSE, token, API y consulta de respaldo de cinco segundos |
| Llamado no se ve en otra terminal | BroadcastChannel/storage no sincronizan terminales distintos |
| No imprime | Habilitación, transporte TCP, host/puerto, conectividad desde API y alternativa del navegador |
| Logo roto | APP_URL, archivo persistente y ruta `/uploads/` |
| Error tras vender | Consultar pedido, stock e ingreso antes de volver a enviar |

## Responsables por asignar

Proveedor: alojamiento, actualizaciones, soporte y copias según contrato. Cliente: usuarios autorizados, catálogo, equipos y conteo físico. La distribución final, los horarios y los tiempos de respuesta deben quedar en el acta/contrato de entrega; no se asumen aquí.
