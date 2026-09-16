# Procedimientos operativos y contingencia

Versión 1.1 · 16 de septiembre de 2026. Aplicables como guía del piloto en una empresa. El negocio debe asignar personas responsables y aprobar los criterios de caja/corrección antes de operar. Los procedimientos no sustituyen las correcciones técnicas pendientes.

## PO-01 Preparación de jornada

**Responsable:** supervisor. **Frecuencia:** antes de vender.

1. Verificar fecha/hora, empresa, sucursal y acceso de cada puesto.
2. Revisar catálogo disponible, precios y existencias de insumos críticos.
3. Comprobar impresora y pantallas con prueba identificada, sin duplicar ventas reales.
4. Contar base inicial y asignar cajero.
5. Abrir caja y comprobar responsable/base.
6. Informar al personal productos no disponibles y contacto para incidencias.

**Salida:** puestos preparados, caja abierta y responsables identificados. Si aparece información de otra empresa, detener uso y reportar como crítico.

## PO-02 Venta interrumpida o posible duplicado

**Disparador:** error de red, espera prolongada o falta de confirmación tras vender.

1. No volver a pulsar confirmar ni crear otro pedido para «probar».
2. Registrar hora, usuario, productos, total, cliente y medio de pago.
3. Buscar en Dashboard pedidos con esos datos y revisar comprobante externo del pago.
4. Si existe pedido, comprobar detalles, stock, ingreso y puntos con supervisor/soporte. No asumir que todos los efectos quedaron completos.
5. Si no existe, soporte verifica persistencia antes de autorizar reintento.
6. Si existen dos pedidos, registrar ambos y aplicar gestión de excepción; no borrar uno sin conciliación.
7. Cerrar incidencia solo después de documentar una única venta válida y sus efectos correctos.

**Control:** la aplicación no implementa idempotencia acreditada; el registro de incidencia evita reintentos ciegos, pero no reemplaza una solución técnica.

## PO-03 Corrección y anulación

**Antes de confirmar:** corregir carrito, retirar línea, cambiar cantidad o reiniciar la selección.

**Después de confirmar:** supervisor recibe solicitud, identifica motivo y pedido, verifica si hubo pago, preparación, entrega o consumo de ingredientes. Debe distinguir devolución de dinero, cambio de producto y desperdicio de un alimento ya preparado.

| Efecto que revisar | Pregunta de control |
| --- | --- |
| Pedido | ¿Qué se entregó y qué estado debe conservarse? |
| Dinero | ¿Se cobró, devolvió o compensó? ¿Hay comprobante? |
| Inventario | ¿El alimento se produjo/consumió o los insumos siguen disponibles? |
| Puntos | ¿Se asignaron o redimieron puntos vinculados? |
| Movimiento financiero | ¿Debe compensarse el ingreso y con qué referencia? |
| Reportes | ¿Cómo se reflejará la corrección sin duplicar efectos? |

El cambio a ANULADO **no compensa** esos efectos en la implementación probada. No publicar una secuencia de ajustes manuales universales: devolver stock de comida ya consumida también sería incorrecto. Soporte debe elaborar un plan por caso, con supervisor, y probarlo en ambiente de ensayo. Registrar importes/saldos antes y después y quién ejecutó cada acción.

**Condición para piloto:** disponer de procedimiento aprobado y probado para cada excepción admitida o mantener la operación que la requiere bloqueada. No declarar resolución por solo cambiar el estado.

Formato de incidencia: número, fecha, pedido, motivo, estado de preparación, pago recibido, acción acordada por efecto, responsable, evidencia y verificación final.

## PO-04 Arqueo por método de pago

**Responsable:** cajero prepara; supervisor verifica. **Momento:** cierre o relevo acordado.

1. Acordar pausa de nuevas ventas durante el conteo.
2. Obtener ventas por medio y contar efectivo físico.
3. Separar base inicial y documentar otros movimientos de dinero.
4. Comparar cobros electrónicos con sus comprobantes externos.
5. Identificar diferencias y pedidos dudosos; resolver o dejar incidencia antes de firmar.
6. Registrar cierre solo con el criterio aprobado para el campo de monto final.

| Medio / concepto | Esperado | Verificado | Diferencia | Evidencia |
| --- | --- | --- | --- | --- |
| Base inicial | ___ | ___ | ___ | Conteo de apertura |
| Efectivo de ventas | ___ | ___ | ___ | Pedidos / conteo |
| Tarjeta | ___ | ___ | ___ | Cierre de terminal |
| Transferencia | ___ | ___ | ___ | Comprobantes |
| Nequi | ___ | ___ | ___ | Comprobantes |
| Daviplata | ___ | ___ | ___ | Comprobantes |
| Otros ingresos/retiros de efectivo | ___ | ___ | ___ | Referencias autorizadas |

**Efectivo físico esperado:** base + cobros efectivos + otros ingresos efectivos − devoluciones/retiros efectivos documentados. Esta fórmula operativa no es la implementada por CajaService: el servicio suma ventas de todos los métodos y no reconcilia automáticamente todos los movimientos manuales.

La diferencia no se elimina cambiando registros para que «cuadren». El piloto necesita corregir el cálculo o acordar una conciliación externa validada, conservando sus limitaciones. Cierre automático y monto omitido no acreditan conteo físico.

Firma de cajero: ______. Firma de supervisor: ______. Caja/fecha: ______. Incidencias abiertas: ______.

## PO-05 Conteo y ajuste de inventario

1. Definir insumos a contar y hora de corte; coordinar pedidos en preparación.
2. Contar en la unidad de stock y documentar conversión usada.
3. Comparar saldo físico con sistema; revisar ventas, recetas, lotes, consumo interno y movimientos.
4. Investigar diferencias antes de sustituir saldo.
5. Si se autoriza AJUSTE, ingresar el saldo físico final y referencia del conteo.
6. Revisar resultado, historial y responsable.

| Insumo | Unidad | Saldo sistema | Conteo físico | Diferencia | Motivo y autorización |
| --- | --- | --- | --- | --- | --- |
| ___ | ___ | ___ | ___ | ___ | ___ |

No usar ajustes para ocultar una receta o factor incorrecto; corregir causa y comprobar una venta de ensayo. El stock global de la versión actual impide certificar aislamiento entre negocios.

## PO-06 Caída de servicio, red o energía

**Activación:** supervisor identifica que no puede operar de forma confiable y registra hora de inicio. Si desconoce si una venta se guardó, aplicar PO-02.

1. Avisar al equipo y evitar registros simultáneos en sistemas alternos sin coordinación.
2. Si el negocio autoriza continuar, registrar pedidos en el formato de contingencia con folio único, por ejemplo `CONT-fecha-secuencia`.
3. Entregar a cocina una comanda identificada con ese mismo folio.
4. Mantener comprobantes de cobro y estado de entrega asociados al folio.
5. No emitir documentos con apariencia de factura electrónica del sistema si no existe emisión.
6. Al restablecerse, supervisor verifica primero qué pedidos ya estaban guardados.
7. Conciliar cada folio contra pedidos existentes; separar «ya registrado», «pendiente de incorporar» y «no debe incorporarse como venta».
8. Acordar con soporte cómo incorporar pendientes, considerando que el POS descuenta stock, suma puntos y registra ingreso al crear el pedido. No duplicar ajustes hechos durante contingencia.
9. Firmar conciliación y cerrar el evento cuando los efectos estén verificados.

| Folio | Hora | Productos / modificaciones | Total / medio | Cobro comprobado | Preparado / entregado | Pedido final o resolución |
| --- | --- | --- | --- | --- | --- | --- |
| ___ | ___ | ___ | ___ | ___ | ___ | ___ |

**Límite:** no existe modo offline del producto. Este es un registro operativo externo propuesto que debe aprobar el negocio.

## PO-07 Fallo de impresión o pantalla auxiliar

Primero verificar si el pedido se guardó. Revisar papel, energía, conexión y puesto configurado. Si existe venta, no repetirla para imprimir. Comunicar a cocina mediante el procedimiento de contingencia con el número ya asignado. Conservar referencia hasta producir la copia por el mecanismo autorizado.

Para pantalla auxiliar, revisar bloqueo de ventanas emergentes, monitor correcto y origen de navegador. Si pantalla y emisor están en equipos distintos, la comunicación local de navegador no alcanza: solicitar configuración adicional, no prometer que reiniciar resolverá una limitación de arquitectura.

## PO-08 Copias y recuperación

**Responsable:** proveedor u operador técnico designado; no el cajero. Respaldar base de datos y logos, controlar acceso y conservar copia fuera del host. Frecuencia, retención y tiempos serán acordados antes de operación; la documentación no impone un SLA comercial.

1. Registrar versión, fecha de copia, destino y resultado.
2. Probar restauración en una base aislada; nunca ensayar sobre producción.
3. Verificar conteos, lectura de pedidos y archivos asociados.
4. Ante incidente real, detener escrituras y definir punto de recuperación con supervisor.
5. Registrar datos posteriores al respaldo que deban conciliarse.
6. Recuperar, comprobar consistencia y autorizar reapertura.

La prueba documental ejecutada demuestra una restauración de la base sintética indicada en el informe; no acredita recuperación de infraestructura o datos futuros del cliente.

## PO-09 Altas, bajas y relevo de personal

Asignar cuentas individuales con función y sucursal. Cambiar clave inicial mediante perfil donde esté disponible. Al retirar a una persona, desactivar acceso y revisar sesiones vigentes con soporte; no borrar su historial de operaciones. En relevo, cerrar/conciliar la caja según procedimiento acordado antes de asignar nuevo responsable. No transferir la contraseña del cajero saliente.

## PO-10 Cierre de incidente

Para cada caso registrar origen, impacto, datos afectados, solución, ejecutor, versión, comprobaciones y aceptación del supervisor. Un estado «resuelto» exige evidencia, no solo que dejó de aparecer el mensaje. Si se requieren cambios de software, mantener referencia al defecto y a su prueba de regresión.
