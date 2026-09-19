# 02. Documento de requerimientos

## Propósito y convención

Especificar qué debe ofrecer PowerPOS y contrastarlo con la implementación. Prioridades: **A** alta, **M** media. Estados: observado, parcial o propuesto; ninguno equivale a una prueba aprobada. Los criterios de aceptación definen resultados a comprobar. Toda aprobación de alcance está pendiente del responsable del proyecto.

## Requerimientos funcionales

| ID | Requerimiento y criterio de aceptación | Prioridad | Estado y evidencia |
| --- | --- | --- | --- |
| RF-01 | Autenticar con correo y contraseña. Con datos válidos de usuario y empresa activos, devolver JWT y perfil; rechazar credenciales incorrectas. | A | Observado: `auth/auth.service.ts` |
| RF-02 | Registrar empresa, sucursal principal y administrador; rechazar NIT o correo ya registrados. | A | Observado; creación de administrador separada de empresa: `auth/auth.service.ts` |
| RF-03 | Administrar sucursales y su estado dentro de la empresa. Una consulta de listado no debe devolver sucursales ajenas. | A | Observado: `sucursales` |
| RF-04 | Crear y gestionar usuarios, perfil, estado y permisos. El acceso debe respetar el rol y empresa. | A | Parcial: `usuarios`, controles de rol no uniformes |
| RF-05 | Administrar categorías y subcategorías con nombre, presentación y estado. | M | Observado: `categorias`, relación `CategoriaPadre` |
| RF-06 | Administrar productos con precio, categoría, disponibilidad y receta. No vender productos inactivos o no disponibles. | A | Observado: `productos`, `pedidos` |
| RF-07 | Configurar adicionales y cobrarlos por unidad de producto; rechazar adicionales no permitidos. Conservar nombre y precio de la venta. | A | Observado: `adicionales`, `DetallePedidoAdicional` |
| RF-08 | Registrar pedido con uno o más productos, cantidades positivas, cliente opcional, descuento y pago. Recalcular importes en servidor. | A | Parcial: cálculo observado; validación integral de cantidades y descuento pendiente |
| RF-09 | Exigir caja abierta en la sucursal y vendedor asignado o supervisor para registrar ventas. | A | Observado: `pedidos.crearPedido` |
| RF-10 | Descontar ingredientes de receta respetando exclusiones y consumo de adicionales. | A | Observado; atomicidad y control de stock insuficientes: `pedidos` |
| RF-11 | Consultar pedidos y actualizar estados de preparación y entrega dentro de la empresa. | A | Parcial: actualización observada; transiciones válidas no controladas |
| RF-12 | Actualizar cocina cuando se crea o modifica un pedido. Aceptar eventos SSE y recuperación por consulta periódica. | A | Observado: `pedidos-eventos`, `web/app/cocina` |
| RF-13 | Abrir caja con base y responsable; impedir segunda caja abierta por sucursal. Cerrar mostrando ventas, esperado y diferencia. | A | Observado por lógica de servicio; concurrencia y autorización pendientes |
| RF-14 | Registrar eventos de apertura, cierre e irregularidad; generar alerta por diferencia absoluta superior a 1000. | M | Observado: `caja` |
| RF-15 | Gestionar ingredientes, unidad de compra, conversión, costo y stock mínimo; registrar entradas, salidas y ajustes con historial. | A | Observado; inventario global sin aislamiento empresarial |
| RF-16 | Crear preparaciones y lotes con insumos usados y cantidades producidas; disminuir stock y registrar historial de producción. | A | Observado: `preparaciones` |
| RF-17 | Asociar preparaciones a productos y conocer saldo real de porciones tras ventas. | M | Parcial: asociación existe; disponible suma producción sin restar consumos |
| RF-18 | Administrar clientes y saldos por empresa; acumular y canjear puntos con reglas configurables y snapshot por venta. | A | Implementado: clientes, pedidos, tienda; HTTP probado |
| RF-19 | Registrar ingreso de venta y movimientos manuales de ingreso o egreso; filtrar y resumir por empresa y período. | A | Observado: `financiero`, `pedidos` |
| RF-20 | Consultar estadísticas de ventas y reportes de períodos, empleados, clientes y rentabilidad. | M | Observado: `reportes`, `pedidos.obtenerEstadisticas` |
| RF-21 | Imprimir comanda o recibo y accionar cajón cuando el hardware esté configurado. Informar impresión no realizada. | M | Observado: `impresion`; requiere prueba con equipo real |
| RF-22 | Mostrar resumen y llamado al cliente con comunicación entre ventanas del mismo origen. | M | Observado: `/cliente`, `/llamado`; no sincroniza equipos por sí solo |
| RF-23 | Enviar alertas y felicitaciones mediante los canales configurados; funcionar con integraciones opcionales deshabilitadas. | M | Observado: `notificaciones`, `tareas`; entrega externa no validada |
| RF-24 | Permitir al SUPERADMIN gestionar estado, plan, permisos y capacidades de las empresas; consultar auditoría. | A | Observado: `superadmin`; enforcement global de planes es parcial |
| RF-25 | Registrar consumo de empleados solo para ADMIN_EMPRESA o GERENTE y empresa habilitada; descontar receta sin crear venta. | A | Observado: `consumo-empleados` |
| RF-26 | Registrar actor, empresa y detalle de operaciones auditadas. | M | Parcial: hay auditoría en operaciones seleccionadas, no cobertura total |
| RF-27 | Anular una venta restaurando consistentemente inventario, puntos y efecto financiero según política aprobada. | A | Pendiente: restricciones protectoras implementadas, reversión integral no disponible |
| RF-28 | Emitir factura electrónica y conservar respuesta del proveedor, estados y documento. | M | Propuesto: solo existe bandera de habilitación |

Las rutas de evidencia son relativas a `api/src` salvo indicación contraria. Para pruebas relacionadas, ver [trazabilidad](10-pruebas-y-trazabilidad.md).

## Requerimientos no funcionales

Metas propuestas para acordar, no resultados medidos ni compromisos de servicio existentes.

| ID | Requerimiento | Criterio verificable propuesto | Estado |
| --- | --- | --- | --- |
| RNF-01 | Aislamiento multiempresa | Ninguna consulta o modificación de A debe alcanzar recursos de B, incluyendo inventario, clientes y caja. Probar matriz de IDs cruzados. | Parcial |
| RNF-02 | Autorización de servidor | Toda acción sensible exige rol/capacidad autorizados aunque se invoque fuera de la interfaz. | Parcial |
| RNF-03 | Integridad transaccional | Venta, stock, ingreso y puntos se confirman o revierten juntos ante fallo inducido. | Implementado en ventas; pruebas HTTP de fallo/concurrencia, cobertura de fallos por ampliar |
| RNF-04 | Validación de entradas | Rechazar cantidades no positivas, descuentos fuera de rango, valores no finitos, estados inválidos e IDs ajenos con error controlado. | Parcial |
| RNF-05 | Protección de credenciales | Contraseñas almacenadas como hash; secreto JWT externo obligatorio; HTTPS en despliegue; tokens excluidos de logs. | bcrypt observado; resto por verificar/implementar |
| RNF-06 | Rendimiento | Meta inicial: percentil 95 menor a 2 s para consulta y registro de pedido con 20 usuarios concurrentes y 10000 pedidos; excluir impresión externa, medir aparte notificaciones. | Propuesto, ambiente por acordar |
| RNF-07 | Continuidad | Meta inicial: respaldo diario, pérdida máxima de 24 h y recuperación en 4 h; validar restauración periódica en ambiente aislado. | Propuesto |
| RNF-08 | Usabilidad | Completar una venta con teclado y pantalla táctil; controles legibles, errores visibles y confirmación de resultado sin duplicar operación. | Interfaz observada; evaluación pendiente |
| RNF-09 | Compatibilidad | Ejecutar los flujos principales en navegadores de escritorio seleccionados por el equipo; verificar SSE, BroadcastChannel y voz. | Pendiente de matriz de versiones |
| RNF-10 | Mantenibilidad | Cambios de esquema incluyen migración y actualización de documentación; módulos con responsabilidades delimitadas. | Estructura observada; proceso propuesto |
| RNF-11 | Observabilidad | Registrar errores con correlación, sin contraseña/token; medir fallos de venta e integraciones. | Propuesto |
| RNF-12 | Escalabilidad | Antes de usar varias instancias, distribuir eventos y evitar tareas programadas duplicadas. | Pendiente; eventos hoy en memoria |

## Reglas de negocio observadas

| ID | Regla |
| --- | --- |
| RN-01 | El NIT de empresa, correo de usuario y número de pedido son únicos globalmente. Documento de cliente es único junto con empresa cuando tiene valor. |
| RN-02 | Roles: SUPERADMIN, ADMIN_EMPRESA, GERENTE, CAJERO, COCINERO y DOMICILIARIO. |
| RN-03 | Estados de pedido: PENDIENTE, EN_COCINA, LISTO, ENTREGADO y ANULADO. El enum no impone secuencia. |
| RN-04 | Pagos registrados: EFECTIVO, TARJETA, TRANSFERENCIA, NEQUI y DAVIPLATA. No se verifica pago ante un proveedor. |
| RN-05 | Subtotal de línea = (precio base + suma de precio adicional × cantidad adicional) × cantidad del producto. Total = suma de líneas − descuento manual − descuento de canje + costo de domicilio. |
| RN-06 | Exclusiones se comparan con el nombre del ingrediente; renombrar ingredientes puede afectar esa interpretación. |
| RN-07 | Si el producto tiene adicionales asociados, se toman los activos/disponibles de esa lista. Si no tiene, admite el catálogo activo/disponible de empresa cuando aceptaAdicionales es true. |
| RN-08 | Base de caja no es venta. El cierre actual suma ventas no anuladas de todos los métodos de pago a la base; no es un arqueo exclusivo de efectivo. |
| RN-09 | Un cron revisa cajas cada cinco minutos. Horario codificado: lunes a viernes 15:00–22:00; sábado y domingo 12:00–22:00, usando hora local del servidor. Fuera del horario cierra con monto esperado. |
| RN-10 | Stock bajo: stock ≤ mínimo. Stock crítico: stock ≤ 50 % del mínimo. |
| RN-11 | La empresa define cuánto comprar para ganar un punto y cuánto descuento representa al canjearlo. El programa inicia desactivado, conserva los saldos anteriores y permite excluir categorías y productos. La base elegible recibe su parte proporcional de los descuentos; domicilio excluido y redondeo hacia abajo. No hay valor obligatorio. |
| RN-12 | Consumo de empleado guarda nombre libre del consumidor y usuario que registra; no tiene FK a un empleado consumidor. El valor estimado usa precio de venta de referencia, no costo de ingredientes. |
| RN-13 | Planes configurables: BASICO, MEDIUM y PREMIUM. Modos de preparación: KDS y COMANDAS. |

## Decisiones pendientes del negocio

Confirmar moneda y zona horaria, reglas de descuento, política de stock negativo, anulación/devolución, arqueo por método de pago, horarios por sucursal, valores de fidelización elegidos por cada empresa, matriz definitiva de permisos y requisitos de facturación. Estas decisiones afectan la aceptación; no deben deducirse de etiquetas de interfaz.

## Requerimientos integrados en 1.2

| ID | Requerimiento | Criterio de aceptación | Estado |
| --- | --- | --- | --- |
| RF-29 | Crear tienda automáticamente para cada empresa y permitir personalizar enlace, marca, contenido y visibilidad. | Enlace único; pública solo con empresa activa y tienda publicada; configuración reservada a administrador. | Implementado |
| RF-30 | Mostrar catálogo público conectado a productos, precios, categorías y disponibilidad del POS. | Solo catálogo de esa empresa; sin correos internos, usuarios ni saldos de clientes. | Implementado |
| RF-31 | Recibir solicitudes web con zona, dirección, teléfono, carrito y forma de pago. | Precios y tarifa recalculados por servidor; reintento con misma clave devuelve la misma solicitud. | Implementado |
| RF-32 | Permitir revisar, aceptar o rechazar solicitudes en la bandeja del cajero. | Aviso cada 5 s; caja y sucursal válidas; aceptación atómica y única; rechazo con motivo sin venta. | Implementado |
| RF-33 | Asignar y seguir domicilios hasta su entrega. | Domiciliario de la empresa ve sus asignaciones; entrega actualiza PedidoWeb y Pedido. | Implementado |
| RF-34 | Ofrecer pedido por WhatsApp de cada empresa. | Abre conversación con carrito; no envía ni importa mensajes automáticamente. | Implementado |
| RF-35 | Configurar acumulación y canje por empresa, excluyendo productos/categorías. | Inactivo por defecto; valores positivos al activar; domicilio excluido; canje no supera saldo ni productos. | Implementado |
| RF-36 | Proteger recepción pública y seguimiento. | Límites iniciales de solicitudes, identificador no secuencial, seguimiento sin dirección ni teléfono; sin consulta/canje público de puntos. | Implementado; endurecimiento distribuido pendiente |
