# 09. Manual de usuario

Versión documental 1.2 · Corte 2026-09-15. Para la copia destinada a adquirentes, ver [manual del cliente](cliente/manual-del-cliente.md). Este manual describe pantallas encontradas en el código; las funciones disponibles dependen de la configuración entregada y de las correcciones pendientes.

## Pantallas

| Ruta | Uso |
| --- | --- |
| `/login` | Acceso al sistema |
| `/pos` | Registro de pedidos |
| `/cocina` | Preparación y estado de pedidos |
| `/dashboard` | Resumen operativo, seguimiento y caja |
| `/productos` | Categorías, productos, recetas y adicionales |
| `/inventario` | Ingredientes, stock, historial y preparaciones |
| `/clientes` | Clientes e historial |
| `/financiero` | Ingresos y egresos |
| `/reportes` | Consultas administrativas |
| `/configuracion` | Perfil, empresa, usuarios y sucursales |
| `/consumo-empleados` | Consumo interno habilitado |
| `/cliente` | Resumen mostrado al cliente |
| `/llamado` | Pedido listo y aviso por voz |
| `/superadmin` | Gestión global de empresas |

## Inicio y cierre de sesión

Ingresar a la URL suministrada por el proveedor y usar la cuenta individual. Confirmar nombre, empresa y sucursal. Si aparece una empresa equivocada, suspender operación y reportar. La sesión puede terminar por expiración del token o cambio de día; volver a ingresar. Salir mediante el control de cierre de sesión al dejar el puesto.

## Preparación inicial del negocio

El administrador configura empresa, logo, sucursales y usuarios en Config. En Inventario registra insumos y unidades; en Productos crea categorías, productos, precios y recetas. Definir adicionales y verificar que el consumo de ingredientes corresponde a las unidades elegidas. Ejecutar una venta de ensayo antes de usar datos reales.

No interpretar los planes como un listado contractual universal: documentar qué funciones quedaron habilitadas para la empresa. Consumo staff requiere habilitación específica. El interruptor de facturación electrónica no acredita una integración operativa.

## Jornada del cajero

1. El supervisor abre caja en Dashboard: selecciona cajero e ingresa base inicial.
2. El cajero ingresa al POS con su cuenta asignada.
3. Selecciona productos, cantidades y modificaciones; revisa exclusiones y adicionales.
4. Asocia un cliente si procede y selecciona el método de pago realmente recibido.
5. Confirma una sola vez y comprueba número de pedido y total.
6. Entrega recibo según impresión habilitada y verifica comunicación a cocina.

Si aparece error después de confirmar, consultar si el pedido fue creado antes de repetir. El sistema registra el método de pago; no confirma una transferencia bancaria ni ejecuta un cobro de tarjeta.

## Cocina y atención

Revisar el pedido completo, incluidos adicionales, exclusiones y observaciones. Actualizar su estado conforme a la operación. Marcar listo al finalizar y entregado cuando el cliente lo reciba. No cambiar a ANULADO para corregir una venta sin procedimiento del supervisor: actualmente no se revierten automáticamente los efectos asociados.

Las pantallas Cliente y Llamado deben abrirse en contextos compatibles del mismo navegador/origen que emite los avisos. Si se usan terminales independientes, requerir una solución de sincronización adicional. La voz depende de disponibilidad y permisos del navegador.

## Inventario y preparaciones

ENTRADA suma al stock; SALIDA resta; AJUSTE establece un saldo. Anotar motivo y revisar historial. Al usar unidad de compra, confirmar factor: una conversión incorrecta afecta existencias y costos. El reporte de stock bajo compara con el mínimo configurado.

La pantalla incluye creación/listado de preparaciones; la API contiene registro de lotes. No se identificó formulario completo de captura de lotes en la UI revisada. Las porciones disponibles representan suma producida, no saldo real tras ventas; requieren revisión del responsable.

## Clientes y fidelización

Buscar cliente antes de crear otro. Registrar solo datos necesarios para el servicio. Revisar historial y puntos. La empresa define cuánto comprar para ganar un punto y cuánto descuento representa al canjearlo. El programa inicia desactivado, conserva los saldos anteriores y permite excluir categorías y productos. La base elegible recibe su parte proporcional de los descuentos; domicilio excluido y redondeo hacia abajo. No hay valor obligatorio. El canje se realiza en POS y los ajustes manuales solo por administrador.

## Finanzas y reportes

En Financiero registrar ingresos/egresos manuales con categoría y descripción; las ventas crean ingreso automáticamente, por lo que no deben duplicarse manualmente. Consultar períodos y reportes. El indicador de utilidad es ingresos menos egresos registrados, no una contabilidad integral. Diferencias entre reportes pueden requerir revisar anulaciones y filtros.

## Consumo staff

Si está habilitado, administrador/gerente registra nombre del empleado, productos y cantidades. El consumo descuenta receta y no es venta. El valor mensual usa precio de referencia del producto; no es costo exacto de producción ni cobro al empleado.

## Cierre de jornada

Conciliar efectivo y otros medios por separado; revisar ventas, eventos e incidencias. Ingresar monto final y cerrar caja en Dashboard. La aplicación compara contra base más ventas de todos los medios: acordar cómo se usa ese campo antes del cierre real. Si se omite monto, se puede usar esperado, lo que no acredita un conteo. Hay cierre automático fuera del horario codificado del servidor.

## Soporte

Reportar pantalla, fecha/hora, usuario sin contraseña, sucursal, número de pedido, acción y mensaje de error. Adjuntar evidencia sin datos sensibles innecesarios. No compartir tokens, contraseñas ni respaldo completo por canales no acordados. Contacto, horario y tiempos de atención deben completarse en [acta de entrega](cliente/acta-de-entrega.md).

## Mi tienda, Domicilios y Puntos

El administrador configura su página en Mi tienda y el programa en Puntos. Cajero, administrador y gerente revisan solicitudes en Domicilios; el domiciliario solo sus asignaciones. El comprador accede sin sesión del personal a /tienda/{slug}. Procedimientos completos en [tiendas, domicilios y fidelización](12-tiendas-domicilios-fidelizacion.md).
