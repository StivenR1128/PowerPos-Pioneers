# Catálogo de rutas declarado en código

Generado desde controladores NestJS. Incluye decoradores, parámetros anotados y referencias; no es OpenAPI ni garantiza validación de cuerpos. `any` requiere consultar servicio. Los roles reflejan decoradores, no reglas inferidas de la interfaz.

## /adicionales

Fuente: [api/src/adicionales/adicionales.controller.ts](../../api/src/adicionales/adicionales.controller.ts). Clase: AdicionalesController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/adicionales` | Sin restricción de rol declarada | Query(productoId) | — |
| POST | `/adicionales` | Sin restricción de rol declarada | Body() | — |
| PATCH | `/adicionales/:id` | Sin restricción de rol declarada | Param(id); Body() | — |
| DELETE | `/adicionales/:id` | Sin restricción de rol declarada | Param(id) | — |

## /

Fuente: [api/src/app.controller.ts](../../api/src/app.controller.ts). Clase: AppController. Guards de clase: ninguno declarado.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/` | Sin restricción de rol declarada | — | — |

## /auth

Fuente: [api/src/auth/auth.controller.ts](../../api/src/auth/auth.controller.ts). Clase: AuthController. Guards de clase: ninguno declarado.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | Sin restricción de rol declarada | Body() | — |
| POST | `/auth/registrar-empresa` | Sin restricción de rol declarada | Body() | — |

## /caja

Fuente: [api/src/caja/caja.controller.ts](../../api/src/caja/caja.controller.ts). Clase: CajaController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/caja/abrir` | Sin restricción de rol declarada | Body() | — |
| POST | `/caja/:id/cerrar` | Sin restricción de rol declarada | Param(id); Body() | — |
| GET | `/caja/abierta` | Sin restricción de rol declarada | — | — |
| GET | `/caja/eventos` | Sin restricción de rol declarada | — | — |
| GET | `/caja/alertas` | Sin restricción de rol declarada | — | — |
| POST | `/caja/apertura-irregular` | Sin restricción de rol declarada | Body() | — |

## /categorias

Fuente: [api/src/categorias/categorias.controller.ts](../../api/src/categorias/categorias.controller.ts). Clase: CategoriasController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/categorias` | Sin restricción de rol declarada | Body() | — |
| GET | `/categorias` | Sin restricción de rol declarada | — | — |
| PATCH | `/categorias/:id` | Sin restricción de rol declarada | Param(id); Body() | — |
| DELETE | `/categorias/:id` | Sin restricción de rol declarada | Param(id) | — |

## /clientes

Fuente: [api/src/clientes/clientes.controller.ts](../../api/src/clientes/clientes.controller.ts). Clase: ClientesController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/clientes` | ADMIN_EMPRESA, GERENTE, CAJERO | Query(busqueda) | — |
| POST | `/clientes` | ADMIN_EMPRESA, GERENTE, CAJERO | Body() | — |
| GET | `/clientes/:id` | ADMIN_EMPRESA, GERENTE, CAJERO | Param(id) | — |
| PATCH | `/clientes/:id` | ADMIN_EMPRESA, GERENTE, CAJERO | Param(id); Body() | — |
| PATCH | `/clientes/:id/toggle-activo` | ADMIN_EMPRESA, GERENTE, CAJERO | Param(id) | — |
| POST | `/clientes/:id/puntos/agregar` | ADMIN_EMPRESA | Param(id); Body(puntos) | — |
| POST | `/clientes/:id/puntos/redimir` | ADMIN_EMPRESA, GERENTE, CAJERO | Param(id); Body(puntos) | — |

## /consumo-empleados

Fuente: [api/src/consumo-empleados/consumo-empleados.controller.ts](../../api/src/consumo-empleados/consumo-empleados.controller.ts). Clase: ConsumoEmpleadosController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/consumo-empleados` | ADMIN_EMPRESA, GERENTE | Body() | — |
| GET | `/consumo-empleados` | ADMIN_EMPRESA, GERENTE | Query(sucursalId) | — |
| GET | `/consumo-empleados/resumen` | ADMIN_EMPRESA, GERENTE | — | — |

## /empresa

Fuente: [api/src/empresa/empresa.controller.ts](../../api/src/empresa/empresa.controller.ts). Clase: EmpresaController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/empresa` | Sin restricción de rol declarada | — | — |
| PATCH | `/empresa` | ADMIN_EMPRESA | Body() | — |
| POST | `/empresa/logo` | ADMIN_EMPRESA | UploadedFile() | — |

## /financiero

Fuente: [api/src/financiero/financiero.controller.ts](../../api/src/financiero/financiero.controller.ts). Clase: FinancieroController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/financiero/movimiento` | Sin restricción de rol declarada | Body() | — |
| GET | `/financiero/movimientos` | Sin restricción de rol declarada | Query() | — |
| GET | `/financiero/resumen` | Sin restricción de rol declarada | Query(fechaDesde); Query(fechaHasta) | — |

## /impresion

Fuente: [api/src/impresion/impresion.controller.ts](../../api/src/impresion/impresion.controller.ts). Clase: ImpresionController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/impresion/comanda` | Sin restricción de rol declarada | Body() | — |
| POST | `/impresion/ticket` | Sin restricción de rol declarada | Body() | — |
| POST | `/impresion/abrir-cajon` | Sin restricción de rol declarada | — | — |

## /inventario

Fuente: [api/src/inventario/inventario.controller.ts](../../api/src/inventario/inventario.controller.ts). Clase: InventarioController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/inventario` | Sin restricción de rol declarada | Query(incluirInactivos) | — |
| POST | `/inventario` | Sin restricción de rol declarada | Body() | — |
| GET | `/inventario/alertas` | Sin restricción de rol declarada | — | — |
| GET | `/inventario/:id/historial` | Sin restricción de rol declarada | Param(id) | — |
| POST | `/inventario/:id/ajuste` | Sin restricción de rol declarada | Param(id); Body() | — |
| PATCH | `/inventario/:id` | Sin restricción de rol declarada | Param(id); Body() | — |
| PATCH | `/inventario/:id/toggle-activo` | Sin restricción de rol declarada | Param(id) | — |

## /pedidos

Fuente: [api/src/pedidos/pedidos.controller.ts](../../api/src/pedidos/pedidos.controller.ts). Clase: PedidosController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET (SSE) | `/pedidos/stream` | Sin restricción de rol declarada | — | — |
| POST | `/pedidos` | CAJERO, ADMIN_EMPRESA, GERENTE | Body() | — |
| GET | `/pedidos` | CAJERO, COCINERO, ADMIN_EMPRESA, GERENTE, DOMICILIARIO | Query(sucursalId) | — |
| GET | `/pedidos/estadisticas` | ADMIN_EMPRESA, GERENTE | — | — |
| GET | `/pedidos/:id` | CAJERO, COCINERO, ADMIN_EMPRESA, GERENTE, DOMICILIARIO | Param(id) | — |
| PATCH | `/pedidos/:id/estado` | COCINERO, CAJERO, ADMIN_EMPRESA, GERENTE, DOMICILIARIO | Param(id); Body() | — |

## /preparaciones

Fuente: [api/src/preparaciones/preparaciones.controller.ts](../../api/src/preparaciones/preparaciones.controller.ts). Clase: PreparacionesController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/preparaciones` | Sin restricción de rol declarada | — | — |
| GET | `/preparaciones/:id` | Sin restricción de rol declarada | Param(id) | — |
| POST | `/preparaciones` | Sin restricción de rol declarada | Body() | — |
| PATCH | `/preparaciones/:id` | Sin restricción de rol declarada | Param(id); Body() | — |
| DELETE | `/preparaciones/:id` | Sin restricción de rol declarada | Param(id) | — |
| GET | `/preparaciones/:id/lotes` | Sin restricción de rol declarada | Param(id) | — |
| POST | `/preparaciones/:id/lotes` | Sin restricción de rol declarada | Param(id); Body() | — |

## /productos

Fuente: [api/src/productos/productos.controller.ts](../../api/src/productos/productos.controller.ts). Clase: ProductosController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/productos` | ADMIN_EMPRESA, GERENTE | Body() | — |
| GET | `/productos` | Sin restricción de rol declarada | Query(categoriaId) | — |
| GET | `/productos/:id` | Sin restricción de rol declarada | Param(id) | — |
| PATCH | `/productos/:id` | ADMIN_EMPRESA, GERENTE | Param(id); Body() | — |
| DELETE | `/productos/:id` | ADMIN_EMPRESA, GERENTE | Param(id) | — |

## /reportes

Fuente: [api/src/reportes/reportes.controller.ts](../../api/src/reportes/reportes.controller.ts). Clase: ReportesController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/reportes/empleados` | Sin restricción de rol declarada | — | — |
| GET | `/reportes/clientes` | Sin restricción de rol declarada | Query(limite) | — |
| GET | `/reportes/periodos` | Sin restricción de rol declarada | — | — |
| GET | `/reportes/rentabilidad` | Sin restricción de rol declarada | — | — |
| GET | `/reportes/periodo` | Sin restricción de rol declarada | Query(tipo); Query(fecha) | — |
| GET | `/reportes/diario` | Sin restricción de rol declarada | Query(fecha) | — |
| GET | `/reportes/mensual` | Sin restricción de rol declarada | Query(fecha) | — |
| GET | `/reportes/anual` | Sin restricción de rol declarada | Query(fecha) | — |

## /sucursales

Fuente: [api/src/sucursales/sucursales.controller.ts](../../api/src/sucursales/sucursales.controller.ts). Clase: SucursalesController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/sucursales` | Sin restricción de rol declarada | Body() | — |
| GET | `/sucursales` | Sin restricción de rol declarada | Query(incluirInactivas) | — |
| PATCH | `/sucursales/:id` | Sin restricción de rol declarada | Param(id); Body() | — |
| PATCH | `/sucursales/:id/toggle-activo` | Sin restricción de rol declarada | Param(id) | — |

## /superadmin

Fuente: [api/src/superadmin/superadmin.controller.ts](../../api/src/superadmin/superadmin.controller.ts). Clase: SuperadminController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/superadmin/resumen` | SUPERADMIN | — | — |
| GET | `/superadmin/empresas` | SUPERADMIN | — | — |
| GET | `/superadmin/auditoria` | SUPERADMIN | — | — |
| POST | `/superadmin/empresas` | SUPERADMIN | Body() | — |
| PATCH | `/superadmin/empresas/:id/estado` | SUPERADMIN | Param(id); Body() | — |
| PATCH | `/superadmin/empresas/:id/configuracion` | SUPERADMIN | Param(id); Body() | — |

## /tareas

Fuente: [api/src/tareas/tareas.controller.ts](../../api/src/tareas/tareas.controller.ts). Clase: TareasController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/tareas/probar-cumpleanos` | Sin restricción de rol declarada | — | — |

## /tiendas

Fuente: [api/src/tienda/tienda.controller.ts](../../api/src/tienda/tienda.controller.ts). Clase: TiendaPublicaController. Guards de clase: ninguno declarado.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/tiendas/:slug` | Sin restricción de rol declarada | Param(slug) | — |
| POST | `/tiendas/:slug/pedidos` | Sin restricción de rol declarada | Param(slug); Body() | PedidosPublicosGuard |
| GET | `/tiendas/:slug/pedidos/:id` | Sin restricción de rol declarada | Param(slug); Param(id) | — |

## /tienda-admin

Fuente: [api/src/tienda/tienda.controller.ts](../../api/src/tienda/tienda.controller.ts). Clase: TiendaAdminController. Guards de clase: JwtAuthGuard, RolesGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| GET | `/tienda-admin/resumen` | ADMIN_EMPRESA, GERENTE, CAJERO | — | — |
| GET | `/tienda-admin/configuracion` | ADMIN_EMPRESA, GERENTE, CAJERO | — | — |
| PATCH | `/tienda-admin/configuracion` | ADMIN_EMPRESA | Body() | — |
| GET | `/tienda-admin/pedidos` | ADMIN_EMPRESA, GERENTE, CAJERO, DOMICILIARIO | — | — |
| GET | `/tienda-admin/repartidores` | ADMIN_EMPRESA, GERENTE, CAJERO | — | — |
| PATCH | `/tienda-admin/pedidos/:id` | ADMIN_EMPRESA, GERENTE, CAJERO, DOMICILIARIO | Param(id); Body() | — |

## /usuarios

Fuente: [api/src/usuarios/usuarios.controller.ts](../../api/src/usuarios/usuarios.controller.ts). Clase: UsuariosController. Guards de clase: JwtAuthGuard.

| Método | Ruta | Roles declarados | Entradas anotadas | Guards de método |
| --- | --- | --- | --- | --- |
| POST | `/usuarios` | Sin restricción de rol declarada | Body() | — |
| GET | `/usuarios` | Sin restricción de rol declarada | — | — |
| GET | `/usuarios/mi-perfil` | Sin restricción de rol declarada | — | — |
| PATCH | `/usuarios/mi-perfil` | Sin restricción de rol declarada | Body() | — |
| GET | `/usuarios/:id` | Sin restricción de rol declarada | Param(id) | — |
| PATCH | `/usuarios/:id` | Sin restricción de rol declarada | Param(id); Body() | — |
| PATCH | `/usuarios/:id/permisos` | Sin restricción de rol declarada | Param(id); Body(permisos) | — |
| PATCH | `/usuarios/:id/toggle-activo` | Sin restricción de rol declarada | Param(id) | — |
