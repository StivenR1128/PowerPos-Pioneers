# 06. Diccionario de datos

Generado desde [schema.prisma](../api/prisma/schema.prisma). Describe el esquema del código, no confirma que una base desplegada haya aplicado sus migraciones.

Incluye **26 modelos**, **53 relaciones físicas** y **9 enumeraciones**.

Convenciones: `?` admite nulo; `[]` es lista; `@id` identifica PK, `@unique` unicidad y `@relation` FK. Campos de relación Prisma no son columnas adicionales. `@updatedAt` lo administra Prisma; no implica un trigger de PostgreSQL. `Decimal(p,s)` conserva precisión y escala declaradas; los servicios pueden convertir valores a Number.

## Enumeraciones

| Nombre | Valores |
| --- | --- |
| PlanEmpresa | BASICO, MEDIUM, PREMIUM |
| ModoPreparacion | KDS, COMANDAS |
| RolUsuario | SUPERADMIN, ADMIN_EMPRESA, GERENTE, CAJERO, COCINERO, DOMICILIARIO |
| EstadoPedido | PENDIENTE, EN_COCINA, LISTO, ENTREGADO, ANULADO |
| MetodoPago | EFECTIVO, TARJETA, TRANSFERENCIA, NEQUI, DAVIPLATA |
| EstadoCaja | ABIERTA, CERRADA |
| TipoEventoCaja | APERTURA, CIERRE, APERTURA_IRREGULAR, DIFERENCIA, MOVIMIENTO |
| TipoMovimiento | INGRESO, EGRESO |
| CategoriaMovimiento | VENTA, COMPRA_INSUMOS, NOMINA, SERVICIOS, ARRIENDO, MANTENIMIENTO, IMPUESTOS, OTROS |

## Empresa

Tabla física: `empresas`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| nombre | String | No | — | — |
| nit | String | No | @unique | — |
| email | String | No | — | — |
| telefono | String? | Sí | — | — |
| direccion | String? | Sí | — | — |
| logo | String? | Sí | — | — |
| activo | Boolean | No | @default(true) | — |
| plan | PlanEmpresa | No | @default(BASICO) | — |
| permisos | Json | No | @default("{}") | — |
| modoPreparacion | ModoPreparacion | No | @default(KDS) | — |
| facturacionElectronicaHabilitada | Boolean | No | @default(false) | — |
| consumoEmpleadosHabilitado | Boolean | No | @default(false) | — |
| tiendaSlug | String | No | @unique @default(uuid()) | — |
| tiendaConfig | Json | No | @default("{}") | — |
| fidelizacionConfig | Json | No | @default("{}") | — |
| creadoEn | DateTime | No | @default(now()) | — |
| actualizadoEn | DateTime | No | @updatedAt | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| pedidosWeb | PedidoWeb[] | Lado inverso; FK declarada en el otro modelo |
| usuarios | Usuario[] | Lado inverso; FK declarada en el otro modelo |
| sucursales | Sucursal[] | Lado inverso; FK declarada en el otro modelo |
| categorias | Categoria[] | Lado inverso; FK declarada en el otro modelo |
| productos | Producto[] | Lado inverso; FK declarada en el otro modelo |
| clientes | Cliente[] | Lado inverso; FK declarada en el otro modelo |
| movimientos | MovimientoFinanciero[] | Lado inverso; FK declarada en el otro modelo |
| auditorias | Auditoria[] | Lado inverso; FK declarada en el otro modelo |
| adicionales | Adicional[] | Lado inverso; FK declarada en el otro modelo |
| preparaciones | Preparacion[] | Lado inverso; FK declarada en el otro modelo |
| lotesPreparacion | LotePreparacion[] | Lado inverso; FK declarada en el otro modelo |
| consumosEmpleados | ConsumoEmpleado[] | Lado inverso; FK declarada en el otro modelo |

## Sucursal

Tabla física: `sucursales`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| nombre | String | No | — | — |
| direccion | String? | Sí | — | — |
| telefono | String? | Sí | — | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| pedidosWeb | PedidoWeb[] | Lado inverso; FK declarada en el otro modelo |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| usuarios | Usuario[] | Lado inverso; FK declarada en el otro modelo |
| pedidos | Pedido[] | Lado inverso; FK declarada en el otro modelo |
| cajas | Caja[] | Lado inverso; FK declarada en el otro modelo |
| movimientos | MovimientoFinanciero[] | Lado inverso; FK declarada en el otro modelo |
| consumosEmpleados | ConsumoEmpleado[] | Lado inverso; FK declarada en el otro modelo |

## Usuario

Tabla física: `usuarios`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int? | Sí | —; FK a Empresa.id | — |
| sucursalId | Int? | Sí | —; FK a Sucursal.id | — |
| nombre | String | No | — | — |
| email | String | No | @unique | — |
| password | String | No | — | — |
| rol | RolUsuario | No | — | — |
| permisos | Json? | Sí | — | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |
| actualizadoEn | DateTime | No | @updatedAt | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| entregasWeb | PedidoWeb[] | Lado inverso; FK declarada en el otro modelo |
| empresa | Empresa? | @relation(fields: [empresaId], references: [id]) |
| sucursal | Sucursal? | @relation(fields: [sucursalId], references: [id]) |
| pedidos | Pedido[] | Lado inverso; FK declarada en el otro modelo |
| cajas | Caja[] | Lado inverso; FK declarada en el otro modelo |
| eventos | EventoCaja[] | Lado inverso; FK declarada en el otro modelo |
| movimientos | MovimientoFinanciero[] | Lado inverso; FK declarada en el otro modelo |
| movimientosInventario | MovimientoInventario[] | Lado inverso; FK declarada en el otro modelo |
| lotesPreparacion | LotePreparacion[] | Lado inverso; FK declarada en el otro modelo |
| auditorias | Auditoria[] | Lado inverso; FK declarada en el otro modelo |
| consumosEmpleados | ConsumoEmpleado[] | Lado inverso; FK declarada en el otro modelo |

## Categoria

Tabla física: `categorias`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| parentId | Int? | Sí | —; FK a Categoria.id | — |
| nombre | String | No | — | — |
| descripcion | String? | Sí | — | — |
| icono | String? | Sí | — | — |
| color | String? | Sí | — | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| categoriaPadre | Categoria? | @relation("CategoriaPadre", fields: [parentId], references: [id]) |
| subcategorias | Categoria[] | @relation("CategoriaPadre") |
| productos | Producto[] | Lado inverso; FK declarada en el otro modelo |

## Producto

Tabla física: `productos`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| categoriaId | Int | No | —; FK a Categoria.id | — |
| nombre | String | No | — | — |
| descripcion | String? | Sí | — | — |
| precio | Decimal | No | @db.Decimal(10, 2) | — |
| imagen | String? | Sí | — | — |
| disponible | Boolean | No | @default(true) | — |
| aceptaAdicionales | Boolean | No | @default(true) | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |
| actualizadoEn | DateTime | No | @updatedAt | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| categoria | Categoria | @relation(fields: [categoriaId], references: [id]) |
| ingredientes | ProductoIngrediente[] | Lado inverso; FK declarada en el otro modelo |
| adicionales | ProductoAdicional[] | Lado inverso; FK declarada en el otro modelo |
| preparaciones | ProductoPreparacion[] | Lado inverso; FK declarada en el otro modelo |
| detallesPedido | DetallePedido[] | Lado inverso; FK declarada en el otro modelo |
| consumoEmpleadoItems | ConsumoEmpleadoItem[] | Lado inverso; FK declarada en el otro modelo |

## Ingrediente

Tabla física: `ingredientes`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| nombre | String | No | — | — |
| unidad | String | No | — | — |
| unidadCompra | String? | Sí | — | — |
| factorConversion | Decimal? | Sí | @db.Decimal(10, 3) | — |
| costoUnitario | Decimal? | Sí | @db.Decimal(10, 4) | — |
| stock | Decimal | No | @db.Decimal(10, 3) | — |
| stockMinimo | Decimal | No | @db.Decimal(10, 3) @default(0) | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| productos | ProductoIngrediente[] | Lado inverso; FK declarada en el otro modelo |
| movimientos | MovimientoInventario[] | Lado inverso; FK declarada en el otro modelo |
| adicionales | Adicional[] | Lado inverso; FK declarada en el otro modelo |
| preparacionIngredientes | PreparacionIngrediente[] | Lado inverso; FK declarada en el otro modelo |
| lotePreparacionIngredientes | LotePreparacionIngrediente[] | Lado inverso; FK declarada en el otro modelo |

## MovimientoInventario

Tabla física: `movimientos_inventario`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| ingredienteId | Int | No | —; FK a Ingrediente.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| tipo | String | No | — | — |
| cantidadMovida | Decimal | No | @db.Decimal(10, 3) | — |
| unidadCompra | String? | Sí | — | — |
| factorAplicado | Decimal? | Sí | @db.Decimal(10, 3) | — |
| stockAnterior | Decimal | No | @db.Decimal(10, 3) | — |
| stockNuevo | Decimal | No | @db.Decimal(10, 3) | — |
| descripcion | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| ingrediente | Ingrediente | @relation(fields: [ingredienteId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |

## ProductoIngrediente

Tabla física: `producto_ingredientes`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| productoId | Int | No | —; FK a Producto.id | — |
| ingredienteId | Int | No | —; FK a Ingrediente.id | — |
| cantidad | Decimal | No | @db.Decimal(10, 3) | — |

Restricciones de modelo: `@@unique([productoId, ingredienteId])`.

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| producto | Producto | @relation(fields: [productoId], references: [id]) |
| ingrediente | Ingrediente | @relation(fields: [ingredienteId], references: [id]) |

## Preparacion

Tabla física: `preparaciones`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| nombre | String | No | — | — |
| descripcion | String? | Sí | — | — |
| unidad | String | No | @default("porciones") | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| ingredientes | PreparacionIngrediente[] | Lado inverso; FK declarada en el otro modelo |
| lotes | LotePreparacion[] | Lado inverso; FK declarada en el otro modelo |
| productoPreparaciones | ProductoPreparacion[] | Lado inverso; FK declarada en el otro modelo |

## PreparacionIngrediente

Tabla física: `preparacion_ingredientes`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| preparacionId | Int | No | —; FK a Preparacion.id | — |
| ingredienteId | Int | No | —; FK a Ingrediente.id | — |
| cantidad | Decimal | No | @db.Decimal(10, 3) | — |
| unidad | String? | Sí | — | — |
| observacion | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| preparacion | Preparacion | @relation(fields: [preparacionId], references: [id]) |
| ingrediente | Ingrediente | @relation(fields: [ingredienteId], references: [id]) |

## LotePreparacion

Tabla física: `lotes_preparacion`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| preparacionId | Int | No | —; FK a Preparacion.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| fecha | DateTime | No | @default(now()) | — |
| loteNumero | String? | Sí | — | — |
| cantidadProducida | Decimal | No | @db.Decimal(10, 3) | — |
| pesoTotal | Decimal? | Sí | @db.Decimal(10, 3) | — |
| pesoPorBolsa | Decimal? | Sí | @db.Decimal(10, 3) | — |
| porcionesPorBolsa | Decimal? | Sí | @db.Decimal(10, 3) | — |
| porcionesTotales | Decimal? | Sí | @db.Decimal(10, 3) | — |
| observacion | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| preparacion | Preparacion | @relation(fields: [preparacionId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |
| ingredientes | LotePreparacionIngrediente[] | Lado inverso; FK declarada en el otro modelo |

## LotePreparacionIngrediente

Tabla física: `lote_preparacion_ingredientes`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| loteId | Int | No | —; FK a LotePreparacion.id | — |
| ingredienteId | Int | No | —; FK a Ingrediente.id | — |
| cantidadUsada | Decimal | No | @db.Decimal(10, 3) | — |
| unidad | String? | Sí | — | — |
| observacion | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| lote | LotePreparacion | @relation(fields: [loteId], references: [id]) |
| ingrediente | Ingrediente | @relation(fields: [ingredienteId], references: [id]) |

## ProductoPreparacion

Tabla física: `producto_preparaciones`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| productoId | Int | No | —; FK a Producto.id | — |
| preparacionId | Int | No | —; FK a Preparacion.id | — |
| cantidad | Decimal | No | @db.Decimal(10, 3) @default(1) | — |
| unidad | String | No | @default("porciones") | — |
| createdAt | DateTime | No | @default(now()) | — |

Restricciones de modelo: `@@unique([productoId, preparacionId])`.

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| producto | Producto | @relation(fields: [productoId], references: [id]) |
| preparacion | Preparacion | @relation(fields: [preparacionId], references: [id]) |

## Adicional

Tabla física: `adicionales`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| nombre | String | No | — | — |
| precio | Decimal | No | @db.Decimal(10, 2) | — |
| ingredienteId | Int? | Sí | —; FK a Ingrediente.id | — |
| cantidad | Decimal? | Sí | @db.Decimal(10, 3) | consumo de inventario por 1 unidad de adicional |
| disponible | Boolean | No | @default(true) | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |
| actualizadoEn | DateTime | No | @updatedAt | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| ingrediente | Ingrediente? | @relation(fields: [ingredienteId], references: [id]) |
| productos | ProductoAdicional[] | Lado inverso; FK declarada en el otro modelo |
| detalles | DetallePedidoAdicional[] | Lado inverso; FK declarada en el otro modelo |

## ProductoAdicional

Tabla física: `producto_adicionales`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| productoId | Int | No | —; FK a Producto.id | — |
| adicionalId | Int | No | —; FK a Adicional.id | — |

Restricciones de modelo: `@@unique([productoId, adicionalId])`.

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| producto | Producto | @relation(fields: [productoId], references: [id]) |
| adicional | Adicional | @relation(fields: [adicionalId], references: [id]) |

## Cliente

Tabla física: `clientes`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| nombre | String | No | — | — |
| documento | String? | Sí | — | — |
| telefono | String? | Sí | — | — |
| email | String? | Sí | — | — |
| direccion | String? | Sí | — | — |
| fechaNacimiento | DateTime? | Sí | — | — |
| puntos | Int | No | @default(0) | — |
| activo | Boolean | No | @default(true) | — |
| creadoEn | DateTime | No | @default(now()) | — |

Restricciones de modelo: `@@unique([empresaId, documento])`.

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| pedidos | Pedido[] | Lado inverso; FK declarada en el otro modelo |

## Pedido

Tabla física: `pedidos`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| sucursalId | Int | No | —; FK a Sucursal.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| clienteId | Int? | Sí | —; FK a Cliente.id | — |
| cajaId | Int? | Sí | —; FK a Caja.id | — |
| numero | String | No | @unique | — |
| estado | EstadoPedido | No | @default(PENDIENTE) | — |
| metodoPago | MetodoPago | No | @default(EFECTIVO) | — |
| subtotal | Decimal | No | @db.Decimal(10, 2) | — |
| descuento | Decimal | No | @db.Decimal(10, 2) @default(0) | — |
| total | Decimal | No | @db.Decimal(10, 2) | — |
| observacion | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |
| actualizadoEn | DateTime | No | @updatedAt | — |
| puntosGanados | Int | No | @default(0) | — |
| puntosCanjeados | Int | No | @default(0) | — |
| valorPuntoAplicado | Decimal | No | @db.Decimal(10, 2) @default(0) | — |
| costoDomicilio | Decimal | No | @db.Decimal(10, 2) @default(0) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| pedidoWeb | PedidoWeb? | Lado inverso; FK declarada en el otro modelo |
| sucursal | Sucursal | @relation(fields: [sucursalId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |
| cliente | Cliente? | @relation(fields: [clienteId], references: [id]) |
| caja | Caja? | @relation(fields: [cajaId], references: [id]) |
| detalles | DetallePedido[] | Lado inverso; FK declarada en el otro modelo |
| movimientos | MovimientoFinanciero[] | Lado inverso; FK declarada en el otro modelo |

## DetallePedido

Tabla física: `detalle_pedidos`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| pedidoId | Int | No | —; FK a Pedido.id | — |
| productoId | Int | No | —; FK a Producto.id | — |
| cantidad | Int | No | — | — |
| precioUnitario | Decimal | No | @db.Decimal(10, 2) | — |
| subtotal | Decimal | No | @db.Decimal(10, 2) | — |
| exclusiones | String[] | No | — | — |
| observacion | String? | Sí | — | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| pedido | Pedido | @relation(fields: [pedidoId], references: [id]) |
| producto | Producto | @relation(fields: [productoId], references: [id]) |
| adicionales | DetallePedidoAdicional[] | Lado inverso; FK declarada en el otro modelo |

## DetallePedidoAdicional

Tabla física: `detalle_pedido_adicionales`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| detallePedidoId | Int | No | —; FK a DetallePedido.id | — |
| adicionalId | Int | No | —; FK a Adicional.id | — |
| nombre | String | No | — | snapshot del nombre al momento de la venta |
| precio | Decimal | No | @db.Decimal(10, 2) | snapshot del precio unitario |
| cantidad | Int | No | @default(1) | unidades del adicional por unidad de producto |
| subtotal | Decimal | No | @db.Decimal(10, 2) | precio * cantidad * detalle.cantidad |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| detalle | DetallePedido | @relation(fields: [detallePedidoId], references: [id]) |
| adicional | Adicional | @relation(fields: [adicionalId], references: [id]) |

## Caja

Tabla física: `cajas`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| sucursalId | Int | No | —; FK a Sucursal.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| estado | EstadoCaja | No | @default(ABIERTA) | — |
| montoInicial | Decimal | No | @db.Decimal(10, 2) | — |
| montoFinal | Decimal? | Sí | @db.Decimal(10, 2) | — |
| diferencia | Decimal? | Sí | @db.Decimal(10, 2) | — |
| abiertaEn | DateTime | No | @default(now()) | — |
| cerradaEn | DateTime? | Sí | — | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| sucursal | Sucursal | @relation(fields: [sucursalId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |
| pedidos | Pedido[] | Lado inverso; FK declarada en el otro modelo |
| eventos | EventoCaja[] | Lado inverso; FK declarada en el otro modelo |

## EventoCaja

Tabla física: `eventos_caja`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| cajaId | Int | No | —; FK a Caja.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| tipo | TipoEventoCaja | No | — | — |
| descripcion | String | No | — | — |
| esAlerta | Boolean | No | @default(false) | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| caja | Caja | @relation(fields: [cajaId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |

## MovimientoFinanciero

Tabla física: `movimientos_financieros`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| sucursalId | Int | No | —; FK a Sucursal.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| tipo | TipoMovimiento | No | — | — |
| categoria | CategoriaMovimiento | No | — | — |
| descripcion | String | No | — | — |
| monto | Decimal | No | @db.Decimal(10, 2) | — |
| fecha | DateTime | No | @default(now()) | — |
| pedidoId | Int? | Sí | —; FK a Pedido.id | — |
| comprobante | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| sucursal | Sucursal | @relation(fields: [sucursalId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |
| pedido | Pedido? | @relation(fields: [pedidoId], references: [id]) |

## ConsumoEmpleado

Tabla física: `consumos_empleados`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| sucursalId | Int | No | —; FK a Sucursal.id | — |
| usuarioId | Int | No | —; FK a Usuario.id | — |
| empleadoNombre | String | No | — | — |
| observacion | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| sucursal | Sucursal | @relation(fields: [sucursalId], references: [id]) |
| usuario | Usuario | @relation(fields: [usuarioId], references: [id]) |
| items | ConsumoEmpleadoItem[] | Lado inverso; FK declarada en el otro modelo |

## ConsumoEmpleadoItem

Tabla física: `consumo_empleado_items`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| consumoEmpleadoId | Int | No | —; FK a ConsumoEmpleado.id | — |
| productoId | Int | No | —; FK a Producto.id | — |
| cantidad | Int | No | — | — |
| precioReferencia | Decimal | No | @db.Decimal(10, 2) | — |

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| consumo | ConsumoEmpleado | @relation(fields: [consumoEmpleadoId], references: [id]) |
| producto | Producto | @relation(fields: [productoId], references: [id]) |

## Auditoria

Tabla física: `auditorias`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | Int | No | @id @default(autoincrement()) | — |
| empresaId | Int? | Sí | —; FK a Empresa.id | — |
| usuarioId | Int? | Sí | —; FK a Usuario.id | — |
| accion | String | No | — | — |
| entidad | String | No | — | — |
| entidadId | Int? | Sí | — | — |
| detalle | Json? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |

Restricciones de modelo: `@@index([empresaId, creadoEn])`.

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa? | @relation(fields: [empresaId], references: [id]) |
| usuario | Usuario? | @relation(fields: [usuarioId], references: [id]) |

## PedidoWeb

Tabla física: `pedidos_web`.

| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |
| --- | --- | --- | --- | --- |
| id | String | No | @id @default(uuid()) | — |
| empresaId | Int | No | —; FK a Empresa.id | — |
| sucursalId | Int | No | —; FK a Sucursal.id | — |
| clave | String | No | — | — |
| estado | String | No | @default("RECIBIDO") | — |
| nombre | String | No | — | — |
| telefono | String | No | — | — |
| direccion | String | No | — | — |
| zona | String | No | — | — |
| observacion | String? | Sí | — | — |
| items | Json | No | — | — |
| subtotal | Decimal | No | @db.Decimal(10, 2) | — |
| costoDomicilio | Decimal | No | @db.Decimal(10, 2) | — |
| total | Decimal | No | @db.Decimal(10, 2) | — |
| metodoPago | MetodoPago | No | @default(EFECTIVO) | — |
| pedidoId | Int? | Sí | @unique; FK a Pedido.id | — |
| repartidorId | Int? | Sí | —; FK a Usuario.id | — |
| motivo | String? | Sí | — | — |
| creadoEn | DateTime | No | @default(now()) | — |
| actualizadoEn | DateTime | No | @updatedAt | — |

Restricciones de modelo: `@@unique([empresaId, clave])`; `@@index([empresaId, estado, creadoEn])`.

Relaciones de navegación Prisma:

| Campo | Destino | Declaración |
| --- | --- | --- |
| empresa | Empresa | @relation(fields: [empresaId], references: [id]) |
| pedido | Pedido? | @relation(fields: [pedidoId], references: [id]) |
| sucursal | Sucursal | @relation(fields: [sucursalId], references: [id]) |
| repartidor | Usuario? | @relation(fields: [repartidorId], references: [id]) |
