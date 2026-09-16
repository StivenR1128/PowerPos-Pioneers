# Informe de validación para el piloto

Fecha de informe: 16 de septiembre de 2026 · Versión documental 1.1.

**Conclusión:** se comprobaron funciones operativas en ambiente aislado y se completó material de capacitación con capturas. No se aprueba todavía un despliegue productivo: permanecen defectos de consistencia, validación, aislamiento y compilación del frontend. La aceptación de la empresa piloto requiere resolver y volver a probar los controles afectados.

## 1. Ambientes y alcance

- Pruebas unitarias existentes del backend: Jest, sin datos del cliente.
- Compilación backend: `npm run build`.
- Comprobación TypeScript frontend: `tsc --noEmit --incremental false`.
- Integración: servicios reales compilados y PostgreSQL 16 en contenedor temporal, puerto local 55439, base `powerpos_docs_test`, creada vacía. Se aplicaron las 15 migraciones existentes.
- No se importó el módulo de aplicación completo, por lo que no se iniciaron cron. Notificaciones y eventos externos se sustituyeron por receptores de prueba; no se envió correo, SMS ni WhatsApp ni se accionó hardware.
- Capturas: frontend real en navegador temporal, API interceptada con datos ficticios y escrituras bloqueadas, excepto respuesta sintética de login. No son pruebas de persistencia ni autorización backend.

La prueba de servicios ocurrió el 16 de septiembre a las 02:44 UTC; la toma final de capturas, a las 05:47 UTC. La hora local de Colombia difiere de UTC. No se utilizaron datos comerciales reales.

## 2. Resultados generales

| Verificación | Resultado | Alcance de la conclusión |
| --- | --- | --- |
| Unitarias existentes | 2 suites / 2 pruebas aprobadas | Controlador de ejemplo e impresión por socket de prueba |
| Build backend | Aprobado | Código backend compila en el entorno revisado |
| Migraciones en base vacía | 15 aplicadas | Esquema recreable con esos archivos |
| Escenarios de servicios | 10 aprobados y 3 brechas confirmadas | Persistencia y lógica de los casos enumerados |
| Respaldo/restauración sintética | Aprobado para controles indicados | Dump/restauración en segunda base y conteos coincidentes |
| Capturas de interfaz | 22 archivos únicos, sin errores de página registrados en la ejecución final | Presentación con datos sintéticos; 21 utilizados en manual |
| TypeScript frontend | Fallido, 2 errores | Bloqueo a revisar antes del build productivo |

## 3. Escenarios de servicios comprobados

| ID | Escenario | Resultado observado |
| --- | --- | --- |
| AT-01 | Credenciales válidas e inválidas | Token/rol correctos; clave incorrecta rechazada |
| AT-02 | Vender sin caja | Rechazo y cero pedidos persistidos |
| AT-03 | Abrir caja y repetir apertura | Primera permitida y segunda secuencial rechazada |
| AT-04 | Venta con extra, exclusión y descuento técnico | Subtotal 24000; total 23000; pan 98; cebolla 1000; queso 960; 23 puntos; ingreso 23000 |
| AT-05 | Consultar pedido con otra empresa | PedidosService rechaza el pedido ajeno |
| AT-06 | Cambiar estado | Estado actualizado y evento entregado al receptor de prueba |
| AT-07 | Consumo interno | Descuenta receta sin ingreso; empresa no habilitada rechazada |
| AT-08 | Entrada en unidad de compra | 2 bolsas de 500 sobre saldo 1000 producen saldo 2000 e historial |
| AT-09 | Producción de lote | Se registran 10 porciones y descuento de insumo |
| AT-10 | Anular venta | **Brecha:** persisten inventario consumido, puntos e ingreso |
| AT-11 | Cantidad cero | **Brecha:** se acepta un pedido con línea de cantidad cero |
| AT-12 | Consulta de inventario | **Brecha:** servicio global sin ámbito empresarial |
| AT-13 | Cierre con diferencia | Cierra y registra diferencia de 2000 y alerta en escenario de ensayo |

AT-05 no demuestra aislamiento completo: solo prueba esa operación de pedidos. AT-07 invoca servicio directamente y no valida guard HTTP de roles. AT-03 no prueba carreras de aperturas simultáneas. No se probaron todas las combinaciones de descuentos, unidades o cambios de estado.

## 4. Respaldo y restauración

Se ejecutó `pg_dump` en formato personalizado de la base sintética y se restauró con `pg_restore` en la nueva base `powerpos_docs_restore`, dentro del mismo contenedor aislado.

| Tabla | Base original | Base restaurada |
| --- | --- | --- |
| empresas | 2 | 2 |
| pedidos | 2 | 2 |
| ingredientes | 4 | 4 |
| movimientos_financieros | 2 | 2 |
| clientes | 1 | 1 |

La restauración terminó sin error y los cinco conteos coinciden. No se midió un objetivo contractual de recuperación, no se probó desastre del host ni se restauraron logos reales; faltan esos ensayos en el ambiente que finalmente se despliegue. El resultado no garantiza backups futuros si no se configura su operación.

## 5. Errores de tipos encontrados

| Ubicación | Hallazgo | Acción requerida |
| --- | --- | --- |
| Cocina, uso de `pedido.cliente` | La interfaz `Pedido` no declara `cliente` | Corregir tipo según contrato y recompilar |
| Superadministración, formulario de alta | El estado inicial no declara adminNombre, adminEmail ni adminPassword, usados como claves | Completar tipo/estado del formulario y recompilar |

Son hallazgos de comprobación, no cambios implementados por esta entrega documental. Una vista de desarrollo que renderiza no equivale a build de producción aprobado.

## 6. Pruebas que siguen pendientes

Autorización completa mediante HTTP, cruce de IDs en clientes/caja/inventario, fallos intermedios de escritura, concurrencia, reintentos, credenciales y revocación, stock negativo, restauración integral de archivos, dispositivos reales, integraciones de mensajería, varios equipos/navegadores y jornada operativa con personal. También falta probar la versión desplegada y ejecutar la aceptación firmada de la empresa piloto.

## 7. Evidencia reproducible y decisión

El expediente técnico conserva scripts de captura y prueba, [resultados JSON](../referencias/resultados-aceptacion.json) y [registro de capturas](capturas/capturas.json). Los scripts protegen la base de destino y no borran una base existente para repetir el ensayo.

**Estado de entrega:** documentación ampliada y ensayos parciales completados; piloto productivo **no aprobado aún**. Condiciones para avanzar: correcciones y repruebas de bloqueos, instalación definida, personal capacitado y acta basada en evidencia del ambiente real.
