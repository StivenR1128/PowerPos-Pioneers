# 11. Brechas, riesgos y evolución

Hallazgos de lectura del código, no una auditoría exhaustiva ni una prueba de explotación. Prioridad propuesta: **P0** bloquea aceptación del alcance afectado; **P1** resolver antes de operación estable; **P2** mejora planificada. La decisión de entrega corresponde a responsables del proyecto y cliente con evidencia de pruebas.

## Pendientes para el despliegue

| ID | Prioridad | Evidencia y efecto | Acción y verificación |
| --- | --- | --- | --- |
| B-01 | P0 multiempresa | Ingrediente sin empresa/sucursal e InventarioService sin filtro empresarial. Puede compartirse stock entre negocios. | Definir propietario y stock por ámbito, migrar datos y aprobar CP-22. |
| B-02 | P0 parcial | Clientes ahora filtra por empresa; se verificó rechazo de cliente ajeno. Cierre de caja por ID sigue requiriendo revisión. | Completar matriz de caja y demás recursos. |
| B-03 | P0 acceso | Numerosos controladores solo verifican JWT. Caja no declara autorización de supervisor aunque UI lo indica. | Matriz de permisos de servidor y pruebas por cada rol. |
| B-04 | P0 parcial | Venta y aceptación web ahora son transaccionales; consumo y lotes conservan revisión pendiente. | Ampliar fallos inducidos y transacciones de módulos restantes. |
| B-05 | P0 si se ofrece devolución | Las solicitudes web RECIBIDO se pueden rechazar sin venta. Una venta web aceptada o con movimientos de puntos bloquea la anulación directa y requiere conciliación. No existe todavía un flujo automático de devolución que revierta ingreso e inventario; no presentar ANULADO como reembolso. | Diseñar compensación idempotente. |
| B-06 | P1 parcial | Cantidades, descuentos, canjes y entradas de tienda tienen validaciones; no hay ValidationPipe global. | Completar validación uniforme de otros módulos. |
| B-07 | Mitigado / P1 reintentos POS | Número usa sucursal y UUID; solicitudes web y su aceptación tienen controles de duplicados. POS directo no tiene clave de idempotencia. | Añadir garantía de reintento a venta POS. |
| B-08 | P1 | Apertura de caja usa consulta previa sin restricción única condicional observada; peticiones simultáneas pueden competir. | Garantía de concurrencia y prueba paralela de apertura. |
| B-09 | P1 | Cierre suma todos los pagos a base; monto omitido usa esperado. Cron cierra fuera de horario fijo. | Definir arqueo por medio, conteo real, horarios y zona por sucursal. |
| B-10 | P1 | Stock puede quedar negativo; ventas y consumo descuentan directamente sin MovimientoInventario. | Política de disponibilidad y registro de todos los movimientos. |
| B-11 | P1 si se ofrece saldo de preparaciones | Porciones disponibles solo suman lotes; venta no consume ProductoPreparacion. | Diseñar consumo/asignación de porciones y evitar doble descuento de insumos. |
| B-12 | P1 parcial | HTTP principal/tienda usan NEXT_PUBLIC_API_URL; quedan referencias locales de SSE/impresión, CORS abierto y secreto JWT de respaldo. | Completar configuración por ambiente. |
| B-13 | P1 | JWT conserva actividad/rol previos hasta expiración; token query puede aparecer en logs. | Definir revocación/revalidación y manejo de logs; CP-26. |
| B-14 | P1 | Creación pública de empresa y admin no es transacción integral; acceso público sin limitación observada. | Acordar aprovisionamiento público o administrado y reforzar alta. |
| B-15 | P1 | Fallback sucursal 1 y alertas de inventario empresa 1; algunos avisos no reciben empresaId. | Eliminar supuestos de tenant fijo y validar destinatarios. |
| B-16 | P1 parcial | Restauración sintética verificada en 1.1 y backup local previo a migración 1.2; sin garantía de copias futuras o recuperación de uploads. | Automatizar copias externas y probar recuperación integral. |
| B-17 | P2 o P1 al escalar | SSE en memoria, cron por proceso, Redis sin integración observada. | Coordinar eventos y tareas antes de varias instancias. |
| B-18 | P1 alcance comercial | Bandera de factura no implementa emisión; planes/permisos no tienen enforcement global acreditado. | Delimitar oferta y completar integración solo si se contrata. |
| B-19 | P2 | Pantallas cliente/llamado usan comunicación local del navegador. | Documentar requisito del puesto o implementar canal remoto. |
| B-20 | P1 aceptación | 15 escenarios HTTP de tienda/puntos y builds API/web aprobados; faltan validación operativa y cobertura completa. | Ejecutar piloto, hardware, carga, aislamiento restante y recuperación. |

## Orden de trabajo propuesto

1. **Alcance y consistencia:** decidir si entrega es de una empresa o varias, matriz de permisos, inventario, caja y anulación; corregir B-01 a B-10 según alcance.
2. **Implantación:** configuración por ambiente, credenciales, red de impresión, persistencia, respaldo y hora; completar pruebas de restauración.
3. **Aceptación:** ejecutar casos con datos de ensayo, registrar defectos y capacitar personal.
4. **Entrega:** registrar versión, capacidades efectivas, limitaciones, soporte y firmas.
5. **Evolución:** preparación con saldo real, factura electrónica si se contrata, escalado y sincronización remota.

No se asignan fechas ni esfuerzo porque no se proporcionó capacidad del equipo ni fecha comprometida. La revisión distingue correcciones implementadas en 1.2 de pendientes del sistema.

## Criterio de mantenimiento documental

Cambios de Prisma: regenerar modelo/diccionario y revisar migraciones. Cambios de rutas: regenerar catálogo y contratos. Cambios de negocio: actualizar requerimiento, caso de uso, manual y prueba vinculada. Cada versión entregada debe identificar commit o paquete exacto; esta versión documental incluye cambios locales aún no consolidados.

## Aprobación académica y comercial

Para la entrega académica, explicar la diferencia entre objetivos, capacidades observadas y resultados probados. Para compradores, entregar el manual operativo y acta con funciones habilitadas y limitaciones aceptadas. Mantener este registro técnico disponible para mantenimiento y decisiones de despliegue, sin convertir objetivos propuestos en garantías contractuales.

## Límites del nuevo canal público

No hay pasarela de pago, reserva de inventario al solicitar, geocodificación ni integración automática de conversaciones WhatsApp. Límites iniciales por IP en memoria y teléfono persistente requieren refuerzo distribuido al escalar. No exponer saldos de puntos por teléfono; el personal verifica identidad al asociar cliente.
