# 07. Referencia de API

## Convenciones

Base local: `http://localhost:3000`. No hay prefijo global `/api` en `main.ts`. Cuerpos normalmente JSON con `Content-Type: application/json`; logo usa multipart. Los ejemplos usan IDs ilustrativos que deben sustituirse por registros del ambiente de prueba.

Enviar `Authorization: Bearer <TOKEN>` a rutas protegidas. Login y registro público de empresa no declaran guard. `/` es una ruta de ejemplo. Las respuestas de error de NestJS suelen incluir `statusCode`, `message` y `error`, pero no existe un contrato uniforme documentado para errores de Prisma no interceptados.

[Catálogo completo de 88 rutas](referencias/catalogo-api.md): generado desde los 19 controladores. Incluye guards de clase, roles y parámetros anotados.

## Autenticación

`POST /auth/login`

```json
{
  "email": "operador@example.invalid",
  "password": "CONTRASENA_DEL_AMBIENTE_DE_PRUEBA"
}
```

Respuesta normal: `access_token` y `usuario` con identidad, rol, empresa/sucursal y configuración empresarial. Contraseña incorrecta, usuario inactivo o empresa inactiva se rechazan con 401. Vigencia declarada del JWT: ocho horas.

`POST /auth/registrar-empresa`

```json
{
  "empresa": { "nombre": "Negocio de prueba", "nit": "NIT-PRUEBA-001", "email": "negocio@example.invalid" },
  "admin": { "nombre": "Administrador de prueba", "email": "admin@example.invalid", "password": "CONTRASENA_TEMPORAL_UNICA" }
}
```

Devuelve mensaje, datos de empresa y sucursal. Los duplicados identificados se rechazan con 409. La creación de administrador es posterior a la de empresa; no se garantiza reversión integral en caso de error.

## Caja y venta

`POST /caja/abrir`

```json
{ "montoInicial": 50000, "cajeroId": 7 }
```

La sucursal proviene del token, con respaldo actual a ID 1 cuando falta. Monto no negativo y cajero activo son condiciones comprobadas; el ID 7 es ficticio. Rechaza caja ya abierta.

`POST /pedidos`

```json
{
  "sucursalId": 2,
  "clienteId": 12,
  "metodoPago": "EFECTIVO",
  "descuento": 0,
  "observacion": "Para llevar",
  "items": [
    {
      "productoId": 31,
      "cantidad": 2,
      "exclusiones": ["Cebolla"],
      "observacion": "Sin salsa",
      "adicionales": [{ "adicionalId": 4, "cantidad": 1 }]
    }
  ]
}
```

`clienteId`, `observacion`, `descuento`, adicionales y exclusiones pueden omitirse según la lógica de servicio. `cajaId` es opcional y se resuelve desde la caja abierta. Si se envía explícitamente, hay una comprobación adicional de pertenencia al usuario que puede afectar a supervisores.

El servidor toma precios del catálogo y crea estado PENDIENTE. Devuelve pedido con detalles, adicionales y datos parciales de usuario/cliente. La cantidad y el rango del descuento no tienen validación robusta centralizada. No enviar importes calculados por el cliente como fuente autoritativa.

`GET /pedidos?sucursalId=2` devuelve como máximo 50 pedidos recientes, filtrados por empresa y opcionalmente sucursal. No hay paginación general en esta ruta.

`PATCH /pedidos/:id/estado`

```json
{ "estado": "LISTO" }
```

Actualiza estado y emite evento. ANULADO no desencadena compensación de inventario, puntos o ingresos. Los valores del enum están en el diccionario; la secuencia de transición no se valida.

`POST /caja/:id/cerrar`

```json
{ "montoFinal": 92000 }
```

Devuelve caja actualizada, ventas, esperado, diferencia y marca de automático. El monto esperado incluye ventas de todos los métodos. No usarlo como saldo exclusivo de billetes y monedas.

## Inventario

`POST /inventario`

```json
{ "nombre": "Insumo de prueba", "unidad": "gramos", "stock": 1000, "stockMinimo": 200 }
```

`POST /inventario/:id/ajuste`

```json
{ "tipo": "ENTRADA", "cantidad": 500, "enUnidadCompra": false, "descripcion": "Recepción de prueba" }
```

ENTRADA suma, SALIDA resta; la rama alternativa del servicio sustituye el saldo. Usar AJUSTE para el caso previsto, sin asumir que otros valores serán rechazados. Historial en `GET /inventario/:id/historial`, máximo 50 registros. El inventario no se filtra por empresa.

## Preparaciones y consumo interno

`POST /preparaciones/:id/lotes`

```json
{
  "loteNumero": "LOTE-PRUEBA-001",
  "cantidadProducida": 10,
  "porcionesTotales": 10,
  "observacion": "Producción de prueba",
  "ingredientes": [{ "ingredienteId": 5, "cantidadUsada": 500, "unidad": "gramos" }]
}
```

Se requieren producción y porciones positivas. Los insumos usados se toman del cuerpo. El saldo de porciones mostrado no considera consumos por venta.

`POST /consumo-empleados`

```json
{
  "sucursalId": 2,
  "empleadoNombre": "Empleado de prueba",
  "observacion": "Alimentación del turno",
  "items": [{ "productoId": 31, "cantidad": 1 }]
}
```

Solo ADMIN_EMPRESA/GERENTE; función habilitada en empresa. Devuelve consumo con líneas y referencias. No crea ingreso ni pedido de venta. `GET /consumo-empleados/resumen` ofrece totales mensuales según controlador.

## SSE

`GET /pedidos/stream?token=<TOKEN>` abre `text/event-stream`. La aplicación utiliza token en query para EventSource. El dato de evento tiene forma:

```json
{ "tipo": "CREADO", "pedidoId": 123, "estado": "PENDIENTE" }
```

También se emite `ACTUALIZADO`. El canal filtra por empresa, vive en memoria y no ofrece historial persistente. Evitar registrar URLs con tokens en logs de despliegue. No se observó un guard de rol específico para stream.

## Archivos e impresión

- `POST /empresa/logo`: multipart, campo `logo`, límite 2 MiB, MIME jpg/jpeg/png/gif/webp. Respuesta `{ "logoUrl": "..." }`. El archivo se publica bajo `/uploads/logos/`.
- `POST /impresion/comanda` y `/impresion/ticket`: reciben una representación del pedido para imprimir; no basta con asumir que el servidor recibe únicamente un ID.
- `POST /impresion/abrir-cajon`: solicita pulso al hardware configurado.

## Errores que debe manejar un cliente

| Código | Casos observados o esperados por excepción |
| --- | --- |
| 400 | Caja cerrada/duplicada, producto indisponible, adicional inválido, lote sin cantidad válida |
| 401 | Credenciales inválidas o token no válido |
| 403 | Rol restringido o consumo de empleados deshabilitado |
| 404 | Entidad no encontrada en servicios que lanzan NotFoundException |
| 409 | Duplicado de NIT o correo en registro de empresa |
| 500 | Fallos no controlados; no interpretar como garantía de que nada se guardó |

No se identificó idempotencia para ventas, versionado de API ni documentación OpenAPI. Un error de red al vender requiere consultar el último pedido antes de reintentar. Los cuerpos con `any` no constituyen contratos validados en tiempo de ejecución.
