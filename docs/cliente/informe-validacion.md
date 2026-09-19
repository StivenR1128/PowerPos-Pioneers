# Informe de validación para el piloto

Fecha: 17 de septiembre de 2026 · Versión documental 1.2.

**Conclusión:** API y frontend compilan y se aprobaron 15 escenarios HTTP de tienda, domicilios y puntos en PostgreSQL aislado. Estos resultados no equivalen a aceptación productiva.

## 1. Ambiente y evidencia

Se utilizó PostgreSQL 16 temporal en puerto 55439, base independiente `powerpos_store_test`, con datos ficticios. El script [tienda-integracion.cjs](../../api/test/tienda-integracion.cjs) conserva los escenarios reproducibles. No se enviaron mensajes a clientes.

La migración `20260916070000_tienda_domicilios_fidelizacion` se comprobó en base aislada y se aplicó a la base local de desarrollo `powerpos_dev` después de generar un respaldo. No se desplegó en producción.

## 2. Resultados actuales

| Verificación | Resultado | Alcance |
| --- | --- | --- |
| Compilación API | Aprobada | Código backend compilable |
| Compilación productiva web | Aprobada, 21 rutas | Corregidos los dos errores de tipos de 1.1 |
| Unitarias existentes | 2 pruebas aprobadas | Cobertura limitada de las suites existentes |
| Integración HTTP | 15 escenarios aprobados | Persistencia, permisos y concurrencia del módulo nuevo |
| Navegador con API aislada | Pedido, seguimiento y administración comprobados | Recarga de seguimiento; móvil de 390 px sin desbordamiento horizontal; sin errores JavaScript registrados |
| Migración local | Aplicada tras respaldo | Producción pendiente |

## 3. Escenarios HTTP aprobados

| ID | Escenario y resultado |
| --- | --- |
| TI-01 | Tienda automática y catálogo público sin datos internos de clientes. |
| TI-02 | Fidelización desactivada inicialmente, sin valores comerciales impuestos. |
| TI-03 | Edición de configuración limitada al administrador de empresa. |
| TI-04 | Categorías ajenas rechazadas en configuración de fidelización. |
| TI-05 | Productos, cantidades y totales inválidos rechazados. |
| TI-06 | Clave repetida devuelve la misma solicitud; envío público no crea venta. |
| TI-07 | Aceptación sin caja abierta rechazada sin escrituras parciales. |
| TI-08 | Aceptaciones concurrentes producen una sola venta y respetan exclusión de bebidas. |
| TI-09 | Seguimiento y administración de otra empresa rechazados. |
| TI-10 | Asignación de repartidor y transición de entrega comprobadas. |
| TI-11 | Canje configurable y acumulación sobre base elegible descontada. |
| TI-12 | Canje inválido rechazado sin escrituras parciales. |
| TI-13 | Canjes concurrentes no gastan dos veces el mismo saldo. |
| TI-14 | Clientes aislados por empresa y ajuste manual de puntos restringido por rol. |
| TI-15 | Rechazo registra motivo sin generar venta. |

No se probaron todos los endpoints ni todas las combinaciones de reglas, carga o fallos externos. Los valores monetarios de ensayo no son tarifas recomendadas.

## 4. Evidencia histórica y correcciones

Los [resultados de aceptación 1.1](../referencias/resultados-aceptacion.json) corresponden al ensayo anterior en `powerpos_docs_test`: diez escenarios aprobados y tres brechas observadas. Se conservan sin alterarlos. La cantidad cero entonces aceptada ahora se rechaza; los puntos fijos fueron reemplazados por configuración empresarial. Los errores de tipos de Cocina y superadministración se corrigieron y el build web aprobó.

La restauración sintética de 1.1 terminó sin error y conservó los conteos de empresas (2), pedidos (2), ingredientes (4), movimientos financieros (2) y clientes (1). No se repitió esa restauración durante esta actualización documental ni se acreditó recuperación de archivos productivos.

Las capturas antiguas del [registro](capturas/capturas.json) usan API interceptada y datos sintéticos. Las cinco nuevas de tienda, configuración, puntos y domicilios proceden del ensayo con API y base aisladas. Una captura por sí sola no acredita persistencia ni autorización.

## 5. Pendientes y aceptación

Quedan pendientes aislamiento de inventario, revisión integral de caja y permisos, arqueo por medio, devoluciones con compensación, idempotencia del POS directo, carga, hardware, restauración completa y operación con personal. Ver [brechas](../11-brechas-y-evolucion.md).

WhatsApp abre una conversación y no importa pedidos automáticamente. No hay pasarela integrada; el negocio verifica el pago declarado.

**Estado:** documentación y comprobaciones del módulo actualizadas; aceptación productiva pendiente de corregir los bloqueos aplicables, probar la instalación definitiva, capacitar al piloto y completar el acta con evidencia real.
