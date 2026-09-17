# 05. Modelo entidad-relación

Fuente: [esquema Prisma](../api/prisma/schema.prisma). Modelo físico del código actual, no un diseño idealizado.

Hay **26 entidades** y **53 relaciones con FK**. [Diagrama completo editable](diagramas/er-completo.mmd). Se muestran PK, FK, unicidad individual y algunos campos descriptivos; el [diccionario](06-diccionario-de-datos.md) incluye todos los campos y las restricciones compuestas.

## Lectura de cardinalidades

`||` significa exactamente uno; `o|` o `|o`, cero o uno; `o{`, cero o muchos. La FK obligatoria exige un padre por registro hijo, pero no obliga al padre a tener hijos. Las líneas discontinuas señalan relaciones no identificadoras: las tablas tienen PK propia. Los diagramas por dominio omiten relaciones externas al grupo; el completo y la tabla final incluyen todas.

## Organización y auditoría

[Archivo Mermaid](diagramas/er-01-organizacion.mmd)

```mermaid
erDiagram
  Empresa {
    Int id PK
    String nombre
    String nit UK
    String tiendaSlug UK
  }
  Sucursal {
    Int id PK
    Int empresaId FK
    String nombre
  }
  Usuario {
    Int id PK
    Int empresaId FK "nullable"
    Int sucursalId FK "nullable"
    String nombre
    String email UK
  }
  Auditoria {
    Int id PK
    Int empresaId FK "nullable"
    Int usuarioId FK "nullable"
  }
  Empresa ||..o{ Sucursal : "empresaId"
  Empresa |o..o{ Usuario : "empresaId"
  Sucursal |o..o{ Usuario : "sucursalId"
  Empresa |o..o{ Auditoria : "empresaId"
  Usuario |o..o{ Auditoria : "usuarioId"
```

## Catálogo, recetas y adicionales

[Archivo Mermaid](diagramas/er-02-catalogo.mmd)

```mermaid
erDiagram
  Empresa {
    Int id PK
    String nombre
    String nit UK
    String tiendaSlug UK
  }
  Categoria {
    Int id PK
    Int empresaId FK
    Int parentId FK "nullable"
    String nombre
  }
  Producto {
    Int id PK
    Int empresaId FK
    Int categoriaId FK
    String nombre
  }
  Ingrediente {
    Int id PK
    String nombre
    Decimal stock
  }
  ProductoIngrediente {
    Int id PK
    Int productoId FK
    Int ingredienteId FK
    Decimal cantidad
  }
  Adicional {
    Int id PK
    Int empresaId FK
    String nombre
    Int ingredienteId FK "nullable"
    Decimal cantidad "nullable"
  }
  ProductoAdicional {
    Int id PK
    Int productoId FK
    Int adicionalId FK
  }
  Empresa ||..o{ Categoria : "empresaId"
  Categoria |o..o{ Categoria : "parentId"
  Empresa ||..o{ Producto : "empresaId"
  Categoria ||..o{ Producto : "categoriaId"
  Producto ||..o{ ProductoIngrediente : "productoId"
  Ingrediente ||..o{ ProductoIngrediente : "ingredienteId"
  Empresa ||..o{ Adicional : "empresaId"
  Ingrediente |o..o{ Adicional : "ingredienteId"
  Producto ||..o{ ProductoAdicional : "productoId"
  Adicional ||..o{ ProductoAdicional : "adicionalId"
```

## Ventas, clientes y detalles

[Archivo Mermaid](diagramas/er-03-ventas-caja.mmd)

```mermaid
erDiagram
  Producto {
    Int id PK
    Int empresaId FK
    Int categoriaId FK
    String nombre
  }
  Adicional {
    Int id PK
    Int empresaId FK
    String nombre
    Int ingredienteId FK "nullable"
    Decimal cantidad "nullable"
  }
  Cliente {
    Int id PK
    Int empresaId FK
    String nombre
  }
  Pedido {
    Int id PK
    Int sucursalId FK
    Int usuarioId FK
    Int clienteId FK "nullable"
    Int cajaId FK "nullable"
    String numero UK
    EstadoPedido estado
    Decimal total
  }
  DetallePedido {
    Int id PK
    Int pedidoId FK
    Int productoId FK
    Int cantidad
  }
  DetallePedidoAdicional {
    Int id PK
    Int detallePedidoId FK
    Int adicionalId FK
    String nombre
    Int cantidad
  }
  Cliente |o..o{ Pedido : "clienteId"
  Pedido ||..o{ DetallePedido : "pedidoId"
  Producto ||..o{ DetallePedido : "productoId"
  DetallePedido ||..o{ DetallePedidoAdicional : "detallePedidoId"
  Adicional ||..o{ DetallePedidoAdicional : "adicionalId"
```

## Recetas de preparaciones

[Archivo Mermaid](diagramas/er-04-preparaciones.mmd)

```mermaid
erDiagram
  Producto {
    Int id PK
    Int empresaId FK
    Int categoriaId FK
    String nombre
  }
  Ingrediente {
    Int id PK
    String nombre
    Decimal stock
  }
  Preparacion {
    Int id PK
    Int empresaId FK
    String nombre
  }
  PreparacionIngrediente {
    Int id PK
    Int preparacionId FK
    Int ingredienteId FK
    Decimal cantidad
  }
  ProductoPreparacion {
    Int id PK
    Int productoId FK
    Int preparacionId FK
    Decimal cantidad
  }
  Preparacion ||..o{ PreparacionIngrediente : "preparacionId"
  Ingrediente ||..o{ PreparacionIngrediente : "ingredienteId"
  Producto ||..o{ ProductoPreparacion : "productoId"
  Preparacion ||..o{ ProductoPreparacion : "preparacionId"
```

## Consumo de empleados

[Archivo Mermaid](diagramas/er-05-consumo-empleados.mmd)

```mermaid
erDiagram
  Empresa {
    Int id PK
    String nombre
    String nit UK
    String tiendaSlug UK
  }
  Sucursal {
    Int id PK
    Int empresaId FK
    String nombre
  }
  Usuario {
    Int id PK
    Int empresaId FK "nullable"
    Int sucursalId FK "nullable"
    String nombre
    String email UK
  }
  Producto {
    Int id PK
    Int empresaId FK
    Int categoriaId FK
    String nombre
  }
  ConsumoEmpleado {
    Int id PK
    Int empresaId FK
    Int sucursalId FK
    Int usuarioId FK
  }
  ConsumoEmpleadoItem {
    Int id PK
    Int consumoEmpleadoId FK
    Int productoId FK
    Int cantidad
  }
  Empresa ||..o{ Sucursal : "empresaId"
  Empresa |o..o{ Usuario : "empresaId"
  Sucursal |o..o{ Usuario : "sucursalId"
  Empresa ||..o{ Producto : "empresaId"
  Empresa ||..o{ ConsumoEmpleado : "empresaId"
  Sucursal ||..o{ ConsumoEmpleado : "sucursalId"
  Usuario ||..o{ ConsumoEmpleado : "usuarioId"
  ConsumoEmpleado ||..o{ ConsumoEmpleadoItem : "consumoEmpleadoId"
  Producto ||..o{ ConsumoEmpleadoItem : "productoId"
```

## Caja y finanzas

[Archivo Mermaid](diagramas/er-06-caja-finanzas.mmd)

```mermaid
erDiagram
  Sucursal {
    Int id PK
    Int empresaId FK
    String nombre
  }
  Usuario {
    Int id PK
    Int empresaId FK "nullable"
    Int sucursalId FK "nullable"
    String nombre
    String email UK
  }
  Pedido {
    Int id PK
    Int sucursalId FK
    Int usuarioId FK
    Int clienteId FK "nullable"
    Int cajaId FK "nullable"
    String numero UK
    EstadoPedido estado
    Decimal total
  }
  Caja {
    Int id PK
    Int sucursalId FK
    Int usuarioId FK
    EstadoCaja estado
  }
  EventoCaja {
    Int id PK
    Int cajaId FK
    Int usuarioId FK
  }
  MovimientoFinanciero {
    Int id PK
    Int empresaId FK
    Int sucursalId FK
    Int usuarioId FK
    Int pedidoId FK "nullable"
  }
  Sucursal |o..o{ Usuario : "sucursalId"
  Sucursal ||..o{ Pedido : "sucursalId"
  Usuario ||..o{ Pedido : "usuarioId"
  Caja |o..o{ Pedido : "cajaId"
  Sucursal ||..o{ Caja : "sucursalId"
  Usuario ||..o{ Caja : "usuarioId"
  Caja ||..o{ EventoCaja : "cajaId"
  Usuario ||..o{ EventoCaja : "usuarioId"
  Sucursal ||..o{ MovimientoFinanciero : "sucursalId"
  Usuario ||..o{ MovimientoFinanciero : "usuarioId"
  Pedido |o..o{ MovimientoFinanciero : "pedidoId"
```

## Lotes y movimientos de inventario

[Archivo Mermaid](diagramas/er-07-lotes-inventario.mmd)

```mermaid
erDiagram
  Usuario {
    Int id PK
    Int empresaId FK "nullable"
    Int sucursalId FK "nullable"
    String nombre
    String email UK
  }
  Ingrediente {
    Int id PK
    String nombre
    Decimal stock
  }
  MovimientoInventario {
    Int id PK
    Int ingredienteId FK
    Int usuarioId FK
  }
  Preparacion {
    Int id PK
    Int empresaId FK
    String nombre
  }
  LotePreparacion {
    Int id PK
    Int empresaId FK
    Int preparacionId FK
    Int usuarioId FK
  }
  LotePreparacionIngrediente {
    Int id PK
    Int loteId FK
    Int ingredienteId FK
  }
  Ingrediente ||..o{ MovimientoInventario : "ingredienteId"
  Usuario ||..o{ MovimientoInventario : "usuarioId"
  Preparacion ||..o{ LotePreparacion : "preparacionId"
  Usuario ||..o{ LotePreparacion : "usuarioId"
  LotePreparacion ||..o{ LotePreparacionIngrediente : "loteId"
  Ingrediente ||..o{ LotePreparacionIngrediente : "ingredienteId"
```

## Relaciones físicas completas

| Tabla hija / modelo | FK | Modelo padre / clave | Padre por hijo | Hijos por padre |
| --- | --- | --- | --- | --- |
| Sucursal | empresaId | Empresa.id | 1 | 0..N |
| Usuario | empresaId | Empresa.id | 0..1 | 0..N |
| Usuario | sucursalId | Sucursal.id | 0..1 | 0..N |
| Categoria | empresaId | Empresa.id | 1 | 0..N |
| Categoria | parentId | Categoria.id | 0..1 | 0..N |
| Producto | empresaId | Empresa.id | 1 | 0..N |
| Producto | categoriaId | Categoria.id | 1 | 0..N |
| MovimientoInventario | ingredienteId | Ingrediente.id | 1 | 0..N |
| MovimientoInventario | usuarioId | Usuario.id | 1 | 0..N |
| ProductoIngrediente | productoId | Producto.id | 1 | 0..N |
| ProductoIngrediente | ingredienteId | Ingrediente.id | 1 | 0..N |
| Preparacion | empresaId | Empresa.id | 1 | 0..N |
| PreparacionIngrediente | preparacionId | Preparacion.id | 1 | 0..N |
| PreparacionIngrediente | ingredienteId | Ingrediente.id | 1 | 0..N |
| LotePreparacion | empresaId | Empresa.id | 1 | 0..N |
| LotePreparacion | preparacionId | Preparacion.id | 1 | 0..N |
| LotePreparacion | usuarioId | Usuario.id | 1 | 0..N |
| LotePreparacionIngrediente | loteId | LotePreparacion.id | 1 | 0..N |
| LotePreparacionIngrediente | ingredienteId | Ingrediente.id | 1 | 0..N |
| ProductoPreparacion | productoId | Producto.id | 1 | 0..N |
| ProductoPreparacion | preparacionId | Preparacion.id | 1 | 0..N |
| Adicional | empresaId | Empresa.id | 1 | 0..N |
| Adicional | ingredienteId | Ingrediente.id | 0..1 | 0..N |
| ProductoAdicional | productoId | Producto.id | 1 | 0..N |
| ProductoAdicional | adicionalId | Adicional.id | 1 | 0..N |
| Cliente | empresaId | Empresa.id | 1 | 0..N |
| Pedido | sucursalId | Sucursal.id | 1 | 0..N |
| Pedido | usuarioId | Usuario.id | 1 | 0..N |
| Pedido | clienteId | Cliente.id | 0..1 | 0..N |
| Pedido | cajaId | Caja.id | 0..1 | 0..N |
| DetallePedido | pedidoId | Pedido.id | 1 | 0..N |
| DetallePedido | productoId | Producto.id | 1 | 0..N |
| DetallePedidoAdicional | detallePedidoId | DetallePedido.id | 1 | 0..N |
| DetallePedidoAdicional | adicionalId | Adicional.id | 1 | 0..N |
| Caja | sucursalId | Sucursal.id | 1 | 0..N |
| Caja | usuarioId | Usuario.id | 1 | 0..N |
| EventoCaja | cajaId | Caja.id | 1 | 0..N |
| EventoCaja | usuarioId | Usuario.id | 1 | 0..N |
| MovimientoFinanciero | empresaId | Empresa.id | 1 | 0..N |
| MovimientoFinanciero | sucursalId | Sucursal.id | 1 | 0..N |
| MovimientoFinanciero | usuarioId | Usuario.id | 1 | 0..N |
| MovimientoFinanciero | pedidoId | Pedido.id | 0..1 | 0..N |
| ConsumoEmpleado | empresaId | Empresa.id | 1 | 0..N |
| ConsumoEmpleado | sucursalId | Sucursal.id | 1 | 0..N |
| ConsumoEmpleado | usuarioId | Usuario.id | 1 | 0..N |
| ConsumoEmpleadoItem | consumoEmpleadoId | ConsumoEmpleado.id | 1 | 0..N |
| ConsumoEmpleadoItem | productoId | Producto.id | 1 | 0..N |
| Auditoria | empresaId | Empresa.id | 0..1 | 0..N |
| Auditoria | usuarioId | Usuario.id | 0..1 | 0..N |
| PedidoWeb | empresaId | Empresa.id | 1 | 0..N |
| PedidoWeb | pedidoId | Pedido.id | 0..1 | 0..N |
| PedidoWeb | sucursalId | Sucursal.id | 1 | 0..N |
| PedidoWeb | repartidorId | Usuario.id | 0..1 | 0..N |

## Decisiones y limitaciones del modelo

- Las tablas puente resuelven relaciones muchos a muchos; ProductoIngrediente, ProductoAdicional y ProductoPreparacion impiden pares duplicados mediante claves únicas compuestas.
- Categoria contiene una autorrelación opcional parentId. La FK no evita ciclos jerárquicos por sí misma.
- Usuario puede no tener empresa ni sucursal; esto permite representar SUPERADMIN, aunque el esquema no limita esa excepción a ese rol.
- Ingrediente no tiene empresaId ni sucursalId: su stock es global. MovimientoInventario tampoco tiene FK directa a empresa o sucursal.
- Pedido pertenece a empresa a través de Sucursal; ConsumoEmpleado y MovimientoFinanciero guardan empresa y sucursal, pero sus FKs independientes no aseguran coincidencia empresarial.
- Auditoria.entidadId es una referencia lógica polimórfica, no una FK a cada entidad auditada.
- ConsumoEmpleado.empleadoNombre es texto; usuarioId identifica quién registra. No existe entidad Empleado.
- DetallePedido.exclusiones es un arreglo de nombres, no una tabla de relación con Ingrediente.
- LotePreparacion no tiene saldo consumido, caducidad ni vínculo de asignación a ventas.
- No hay entidades de factura electrónica, impuestos de línea, pagos múltiples por pedido ni stock por sucursal.
- Activo y disponible expresan estados diferentes; desactivar no equivale a borrar físicamente.
- No se declararon onDelete explícitos en estas relaciones. Este documento no atribuye borrado en cascada; revisar las migraciones antes de cualquier eliminación.
