# 10. Plan de pruebas y matriz de trazabilidad

## Estado de validación

Esta entrega verifica documentación contra código y, en la revisión 1.1, ejecuta ensayos con una base PostgreSQL aislada y datos sintéticos. **No acredita aprobación productiva del sistema.** Se ejecutaron dos pruebas unitarias, build de backend y 13 escenarios de servicios: diez aprobados y tres brechas confirmadas. Se probaron migraciones y restauración únicamente en bases temporales. No se utilizaron datos de cliente ni se enviaron notificaciones reales. Ver [informe y alcance exacto](cliente/informe-validacion.md).

Se encontraron pruebas en `api/src/app.controller.spec.ts`, `api/src/impresion/impresion.service.spec.ts` y `api/test/app.e2e-spec.ts`. Cubren un saludo del controlador, impresión por socket simulado y ruta raíz e2e; no acreditan el ciclo de venta ni aislamiento multiempresa.

## Preparación del ambiente

Crear ambiente aislado con dos empresas A/B, sucursales y cuentas de cada rol, catálogo mínimo y existencias conocidas. Usar únicamente datos sintéticos. Deshabilitar correo/Twilio reales y usar impresora simulada hasta prueba controlada de hardware. Controlar tareas cron y hora para que no cierren caja ni disparen mensajes durante las pruebas. Registrar commit y cambios locales incluidos, versiones y migraciones aplicadas.

Datos de cálculo sugeridos: producto a 10000, adicional a 2000, dos unidades con un adicional por unidad y descuento de 1000. Esperado: subtotal 24000, total 23000 y 23 puntos si hay cliente. Para stock, usar inicialmente ingredientes sin factor de conversión; probar conversiones en un caso separado.

## Casos de prueba

La tabla es el plan completo. Los escenarios AT del informe cubren parcialmente CP-01, CP-05, CP-07, CP-08, CP-10 a CP-13, CP-19, CP-20, CP-22 y CP-25. No marcar un CP completo como aprobado cuando solo se probó un subcaso. Un resultado esperado puede representar una mejora requerida que hoy falle.

| ID | Requisitos | Procedimiento resumido | Resultado esperado |
| --- | --- | --- | --- |
| CP-01 | RF-01 | Ingresar con contraseña correcta/incorrecta, usuario inactivo y empresa inactiva. | Solo acceso válido permitido; 401 controlado para rechazo. |
| CP-02 | RF-02 | Registrar empresa y repetir NIT/correo; inducir fallo al crear admin. | Rechazo de duplicados; documentar brecha de atomicidad ante fallo. |
| CP-03 | RF-03, RF-04 | Crear usuario/sucursal, editar perfil y desactivar; probar IDs de B con token A. | Operaciones permitidas limitadas a la empresa. |
| CP-04 | RF-05, RF-06 | Crear categoría padre/hija y producto con receta; desactivar producto e intentar vender. | Catálogo correcto y venta rechazada si no está disponible/activo. |
| CP-05 | RF-07, RF-08 | Vender datos de cálculo sugeridos; probar adicional ajeno. | 23000 total y snapshot correcto; extra ajeno rechazado. |
| CP-06 | RF-08, RNF-04 | Enviar items vacío, cantidad 0/negativa, descuento mayor al subtotal, ID inválido. | Rechazo sin persistencia parcial; registrar fallos actuales. |
| CP-07 | RF-09 | Vender sin caja, con caja ajena y como cajero asignado. | Rechazar los dos primeros y permitir el último. |
| CP-08 | RF-10 | Vender producto con un ingrediente excluido y extra con insumo. | Descuento exacto de receta no excluida y adicional. |
| CP-09 | RF-11, RF-12 | Abrir cocina, crear pedido, cambiar estado, cortar SSE. | Evento visible y recuperación por consulta periódica. |
| CP-10 | RF-13, RF-14 | Abrir caja, intentar segunda, vender por distintos medios y cerrar con diferencia >1000. | Una caja; cálculos actuales identificados y alerta registrada. |
| CP-11 | RF-15 | Registrar entrada, salida y ajuste con/sin conversión. | Saldo y movimiento coherentes, alerta bajo mínimo. |
| CP-12 | RF-16, RF-17 | Crear preparación/lote, consultar porciones y vender producto asociado. | Producción registrada; señalar que descuento de porciones aún no existe. |
| CP-13 | RF-18 | Asociar cliente a venta de 23000; sumar/redimir puntos y consultar historial. | Incremento de 23; canje insuficiente rechazado. |
| CP-14 | RF-19, RF-20 | Crear venta e ingreso/egreso manual; consultar períodos/reportes. | Totales conciliables con registros del período y empresa. |
| CP-15 | RF-21 | Simular socket; probar equipo real sin emitir venta; desconectar impresora. | Impresión confirmada solo cuando procede y fallo visible según configuración. |
| CP-16 | RF-22 | Abrir POS/cliente y cocina/llamado en mismo navegador; probar terminal separado. | Sincronización local; documentar ausencia de sincronización remota. |
| CP-17 | RF-23 | Usar proveedor de prueba; disparar alerta y cumpleaños con/sin configuración. | Evidencia de resultado sin enviar mensajes a personas reales. |
| CP-18 | RF-24, RF-26 | Usar SUPERADMIN y un usuario común para rutas globales; cambiar capacidad. | Solo rol autorizado; auditoría en operaciones instrumentadas. |
| CP-19 | RF-25 | Registrar consumo habilitado/deshabilitado y con rol cajero. | Solo supervisor habilitado; stock disminuye sin venta ni ingreso. |
| CP-20 | RF-27 | Anular venta y revisar inventario, puntos e ingreso. | Reversión integral requerida; comportamiento actual previsto: solo cambia estado. |
| CP-21 | RF-28 | Evaluar bandera y flujo completo de emisión. | No aceptar emisión como implementada hasta integración y prueba de proveedor. |
| CP-22 | RNF-01, RNF-02 | Probar lectura/escritura con IDs cruzados en clientes, inventario, caja y catálogo; invocar rutas con roles no autorizados. | Cero acceso indebido; fallos bloquean aceptación multiempresa. |
| CP-23 | RNF-03 | Inducir fallo entre pedido, stock, ingreso y puntos en ambiente aislado. | Todo o nada; registrar persistencia parcial actual. |
| CP-24 | RNF-03, RNF-06 | Crear ventas simultáneas en dos sucursales y ventas repetidas por reintento. | Numeración única, sin pérdida/duplicación; medir respuesta y colisiones. |
| CP-25 | RNF-07 | Respaldar DB/uploads y restaurar en destino aislado. | Datos consistentes y tiempo/pérdida medidos. |
| CP-26 | RNF-05, RNF-09 | Revisar HTTPS, CORS, secretos, expiración y navegadores seleccionados. | Configuración segura y funciones soportadas documentadas. |
| CP-27 | RNF-08 | Usuario de prueba completa apertura, venta, cocina y cierre con teclado y táctil. | Flujo comprensible, errores visibles y sin duplicación. |
| CP-28 | RNF-10, RNF-11, RNF-12 | Compilar, revisar logs y simular dos instancias si se prevén. | Build reproducible, errores rastreables, eventos/tareas coordinados. |

## Matriz de trazabilidad por componente

| Requerimientos | Componentes | Casos de uso | Pruebas |
| --- | --- | --- | --- |
| RF-01 a RF-04 | auth, usuarios, sucursales | CU-01, CU-10 | CP-01 a CP-03 |
| RF-05 a RF-07 | categorias, productos, adicionales | CU-02 | CP-04, CP-05 |
| RF-08 a RF-10 | pedidos, caja | CU-03, CU-04 | CP-05 a CP-08 |
| RF-11, RF-12 | pedidos, pedidos-eventos, cocina | CU-05 | CP-09 |
| RF-13, RF-14 | caja, dashboard | CU-03, CU-08 | CP-10 |
| RF-15 a RF-17 | inventario, preparaciones | CU-06, CU-07 | CP-11, CP-12 |
| RF-18 | clientes, pedidos | CU-04 | CP-13 |
| RF-19, RF-20 | financiero, reportes | CU-04, CU-08 | CP-14 |
| RF-21 | impresion, pos | CU-04 | CP-15 |
| RF-22 | cliente, llamado, cocina, dashboard | CU-05 | CP-16 |
| RF-23 | notificaciones, tareas | CU-03 a CU-08 | CP-17 |
| RF-24, RF-26 | superadmin, auditoria | CU-10 | CP-18 |
| RF-25 | consumo-empleados | CU-09 | CP-19 |
| RF-27 | pedidos, inventario, financiero, clientes | CU-04, CU-05 | CP-20 |
| RF-28 | Pendiente; bandera en empresa | CU-10 | CP-21 |
| RNF-01 a RNF-12 | Transversales | Todos | CP-06, CP-22 a CP-28 |

## Criterios de entrada y salida

Entrada: ambiente aislado, datos restaurables, configuración registrada y responsables identificados. Salida propuesta: todos los casos críticos de venta, autorización, aislamiento, inventario, caja y recuperación aprobados; defectos menores con plan y aceptación explícita; ninguna función pendiente presentada como entregada. Rendimiento y soporte necesitan metas acordadas antes de aceptación.

## Registro de ejecución por completar

| Campo | Valor |
| --- | --- |
| Caso / fecha / ejecutor | Pendiente |
| Versión y ambiente | Pendiente |
| Datos utilizados | Pendiente |
| Resultado real | Pendiente |
| Evidencia | Pendiente |
| Estado | Pendiente / aprobado / fallido / bloqueado |
| Incidencia y responsable | Pendiente |
| Reprueba y aprobación | Pendiente |
