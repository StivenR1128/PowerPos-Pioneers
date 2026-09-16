# PowerPOS Pioneers — Manual del cliente

Versión documental 1.0 · Fecha: 15 de septiembre de 2026.

Este manual permite preparar y operar el sistema. La URL, empresa, funciones habilitadas y datos de soporte deben constar en el acta de entrega. La versión definitiva debe corresponder al sistema instalado y a las pruebas aprobadas con el proveedor.

## 1. Qué permite hacer

PowerPOS reúne catálogo, pedidos, cocina, caja, ingredientes, clientes y consultas administrativas. Según la configuración entregada, permite imprimir recibos/comandas, mostrar pedidos al cliente y registrar consumo de empleados. Las funciones disponibles deben coincidir con las marcadas en el acta.

Registrar un método de pago no realiza el cobro en banco o datáfono. Un recibo impreso no debe presentarse como factura electrónica emitida por una integración que no se haya entregado y probado. La producción por lotes y su saldo tienen limitaciones descritas en este manual.

## 2. Datos de su instalación

| Dato | Completar por proveedor |
| --- | --- |
| Empresa / sucursal | ____________________ |
| URL de ingreso | ____________________ |
| Versión entregada / fecha | ____________________ |
| Administrador del negocio | ____________________ |
| Contacto de soporte | ____________________ |
| Horario de atención | ____________________ |
| Impresora y puesto configurado | ____________________ |

La contraseña se entrega por el canal acordado, separada de este manual. Cada persona debe utilizar su propia cuenta.

## 3. Antes de empezar

El proveedor y administrador deben verificar acceso, empresa/sucursal correctas, catálogo con precios, recetas con unidades, stock inicial, usuarios, caja, cocina e impresión. Realizar una operación de prueba identificada y comprobar sus efectos antes del inicio real. Acordar cómo se contabilizan pagos no efectivos en el cierre de caja y qué horario usa el sistema.

## 4. Ingresar y salir

1. Abrir la URL de ingreso.
2. Escribir correo y contraseña de su cuenta.
3. Verificar el nombre del usuario y negocio.
4. Usar la pantalla asignada a su función.
5. Cerrar sesión al terminar o dejar el puesto.

Si la sesión vence, ingresar nuevamente. Si no puede acceder, revisar datos y contactar al administrador; no compartir su contraseña con soporte.

## 5. Administrar el negocio

En **Config**, el administrador consulta o gestiona los datos de empresa, logo, sucursales, usuarios y su perfil. En **Productos**, prepara categorías, productos, precios, recetas y adicionales. En **Inventario**, registra insumos, unidades y cantidades disponibles.

Antes de cambiar una unidad de compra o factor de conversión, comprobar con el proveedor cómo se expresan las cantidades de receta. No cambiar factores para corregir un saldo sin revisar sus efectos.

## 6. Abrir caja

El supervisor entra a **Dashboard**, selecciona el cajero responsable e ingresa el monto base de apertura. Confirma y verifica que la caja esté abierta en la sucursal correcta. La base es dinero inicial y no constituye una venta.

Si ya existe una caja abierta, revisar quién la tiene asignada. El POS permite vender al cajero asignado y a supervisores según la configuración. No usar cuentas de otras personas para evitar el bloqueo.

## 7. Registrar un pedido

1. Entrar a **POS**.
2. Elegir producto y cantidad.
3. Revisar ingredientes que se excluyen, adicionales y observaciones.
4. Asociar cliente, si corresponde.
5. Seleccionar el medio de pago realmente recibido.
6. Revisar productos e importe y confirmar una sola vez.
7. Verificar número de pedido y recibo o comanda según configuración.

Los adicionales aumentan el precio por unidad de producto. Las exclusiones indican ingredientes que no deben usarse. Confirmar transferencias o cobros de tarjeta por el procedimiento externo del negocio.

**Si aparece error al confirmar:** consultar el listado o pedir al supervisor que verifique el número y total antes de repetir. Una interrupción puede ocurrir después de registrar parte de la operación.

## 8. Preparar y entregar

El personal de cocina entra a **Cocina** y revisa productos, cantidades, exclusiones y adicionales. Actualiza el estado mientras prepara, marca listo y registra la entrega cuando corresponda. La pantalla recibe actualizaciones y realiza consultas periódicas.

**Cliente** muestra resumen del pedido y **Llamado** puede anunciar pedido listo. En la implementación revisada estas pantallas necesitan ventanas compatibles del mismo navegador y origen que genera el aviso. No se debe asumir que un televisor u ordenador independiente recibe el llamado sin una configuración adicional. La voz requiere soporte del navegador.

## 9. Controlar inventario

Consultar existencias y alertas. Para registrar un cambio:

| Operación | Efecto | Ejemplo |
| --- | --- | --- |
| Entrada | Suma cantidad al saldo | Llegada de insumos |
| Salida | Resta cantidad del saldo | Retiro o pérdida de insumos |
| Ajuste | Reemplaza el saldo por cantidad indicada | Resultado de conteo físico |

Agregar una descripción, revisar unidad y comprobar resultado e historial. No repetir manualmente una salida que ya fue descontada por una venta. Informar stock negativo o consumos inesperados al supervisor.

Las preparaciones agrupan ingredientes y la API permite registrar producción por lotes. En la versión revisada no se encontró un formulario completo para registrar lotes y las porciones mostradas suman producción sin descontar ventas. Confirmar con el proveedor qué parte se entrega operativa; no usar ese indicador como saldo físico definitivo.

## 10. Clientes y puntos

Buscar al cliente antes de crear otro. Registrar sus datos necesarios, asociarlo al pedido y consultar historial. El código revisado suma un punto por cada 1000 del total de venta asociada. Acordar la política de redención con el administrador; no prometer equivalencias de puntos que no estén definidas.

## 11. Finanzas y reportes

En **Financiero**, registrar movimientos manuales con tipo, categoría, monto y descripción. Las ventas generan ingresos automáticamente: no volver a registrarlos manualmente. Revisar reportes de períodos y consultas de clientes/productos/empleados según acceso.

La utilidad mostrada depende de ingresos y egresos registrados; no sustituye una contabilidad completa. Al detectar diferencias, revisar período, anulaciones y movimientos manuales.

## 12. Consumo de empleados

Si aparece **Consumo staff** y está habilitado para la empresa, administrador o gerente puede indicar empleado, productos y cantidades. El consumo descuenta ingredientes sin crear una venta. El estimado mensual se calcula con precio de referencia del producto, no costo exacto ni deuda del trabajador.

## 13. Cerrar caja

1. Revisar ventas e incidencias del turno.
2. Conciliar efectivo y medios electrónicos por separado.
3. Entrar a Dashboard y verificar monto esperado.
4. Ingresar monto final conforme al procedimiento acordado y cerrar.
5. Revisar diferencia y reportar novedades.

El cálculo actual de esperado suma la base y las ventas de todos los medios. No compararlo directamente con solo billetes y monedas sin acordar el criterio. Si se omite monto final, el sistema puede tomar el esperado; eso no demuestra un conteo físico. También existe cierre automático fuera del horario configurado en el código: confirmar horario y zona de su instalación.

## 14. Correcciones y anulaciones

Solicitar intervención del supervisor ante pedido incorrecto. En la versión revisada, cambiar el estado a ANULADO no devuelve automáticamente inventario, puntos ni ingreso financiero. El proveedor debe definir y probar el procedimiento de corrección antes de habilitar su uso operativo. No aplicar ajustes duplicados ni borrar registros para ocultar errores.

## 15. Problemas frecuentes

| Problema | Acción |
| --- | --- |
| No permite vender | Verificar caja abierta y cajero asignado |
| Caja aparece cerrada | Consultar horario automático y supervisor |
| Pedido no aparece en cocina | Verificar conexión y esperar actualización; consultar supervisor antes de duplicar |
| Error después de confirmar | Buscar pedido antes de volver a enviar |
| No imprime | Revisar energía, papel, red y puesto configurado; informar soporte |
| Llamado no aparece | Verificar configuración de navegador y pantalla con proveedor |
| Total o saldo no coincide | Registrar número, fecha y valores y pedir conciliación |
| Logo o página no carga | Verificar conexión y URL asignada |

## 16. Solicitar soporte

Informar empresa/sucursal, fecha/hora, pantalla, número de pedido si existe, qué intentó hacer y mensaje mostrado. No enviar contraseñas ni tokens. El canal, horario y tiempos de atención serán los acordados en el acta. Cuando el sistema no esté disponible, aplicar el procedimiento de contingencia aprobado por el negocio y conciliar registros al restablecerse para evitar duplicados.
