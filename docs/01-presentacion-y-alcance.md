# 01. Presentación y alcance

## Identificación

**Nombre:** PowerPOS Pioneers. **Tipo:** aplicación web de gestión gastronómica con orientación SaaS multiempresa. **Usuarios previstos:** restaurantes, cafeterías, panaderías, food trucks y negocios similares. Esta caracterización procede del README y los módulos implementados; no es el resultado de un estudio de mercado.

## Problema y justificación

La operación gastronómica necesita mantener relacionados los pedidos, sus modificaciones, la preparación en cocina, las existencias de ingredientes y los ingresos del negocio. Llevar estos procesos en registros separados dificulta rastrear qué se vendió, qué se consumió y quién intervino. PowerPOS centraliza esas actividades y ofrece pantallas según el trabajo de caja, cocina y administración.

Se espera reducir errores de transcripción y facilitar el seguimiento operativo. Estos beneficios son objetivos del proyecto; no se dispone de mediciones que permitan cuantificar una mejora frente al proceso anterior.

## Objetivo general

Desarrollar y mantener una plataforma web que integre ventas, preparación, caja, inventario y seguimiento administrativo de negocios gastronómicos, con usuarios autenticados y separación de información por empresa.

## Objetivos específicos

1. Registrar pedidos con cantidades, exclusiones de ingredientes, adicionales y método de pago.
2. Comunicar pedidos a cocina y registrar su estado de preparación y entrega.
3. Relacionar ventas con caja, cliente, vendedor y movimientos financieros.
4. Administrar productos, categorías, recetas, ingredientes y preparaciones por lotes.
5. Ofrecer reportes operativos y seguimiento de consumo interno.
6. Gestionar empresas, sucursales, usuarios y capacidades habilitadas.
7. Establecer documentación, criterios de aceptación y una ruta de mejora verificable.

## Alcance observado

Autenticación JWT; catálogo y categorías jerárquicas; recetas de ingredientes; adicionales; pedidos; cocina; caja y eventos; inventario y ajustes; preparaciones y lotes; clientes y puntos; ingresos y egresos; reportes; impresión ESC/POS; notificaciones; configuración; superadministración; auditoría de determinadas operaciones; consumo de empleados; pantalla de cliente y llamado.

La separación multiempresa es **parcial**: ingredientes y movimientos de inventario no tienen un propietario empresarial directo; algunos accesos por identificador tampoco filtran empresa. La existencia de planes y permisos no demuestra restricciones completas en el servidor.

## Fuera del alcance implementado identificado

- Emisión completa de factura electrónica: se encontró una bandera de configuración, no un módulo de emisión.
- Procesamiento bancario de pagos: los métodos de pago se registran, sin pasarela identificada.
- Contabilidad de partida doble, liquidación de nómina o cuentas por pagar. `NOMINA` es una categoría de egreso.
- Operación sin conexión y sincronización posterior.
- Gestión de rutas de reparto: existe el rol DOMICILIARIO, sin módulo de logística identificado.
- Control de vencimientos, asignación de ventas a lotes y descuento de porciones preparadas.
- Infraestructura productiva desplegada, disponibilidad garantizada o recuperación comprobada.

## Actores y responsabilidades previstas

| Actor | Responsabilidad de negocio |
| --- | --- |
| SUPERADMIN | Administrar empresas, planes, capacidades y consulta global de auditoría |
| ADMIN_EMPRESA | Configurar el negocio y supervisar su operación |
| GERENTE | Supervisar ventas, caja, inventario y reportes |
| CAJERO | Registrar pedidos y pagos de la caja asignada |
| COCINERO | Consultar pedidos y actualizar preparación |
| DOMICILIARIO | Consultar pedidos y actualizar estado según las rutas autorizadas |
| Cliente final | Recibir el pedido y consultar la pantalla de atención; no es una cuenta Usuario |
| Servicios externos | SMTP, Twilio e impresora; intervienen cuando están configurados |

Esta tabla define responsabilidades previstas. Los permisos reales de API están en el documento 07; no todos los controladores restringen por rol.

## Supuestos y restricciones

El navegador accede a una API central y esta a PostgreSQL. El entorno local usa API en 3000 y frontend en 3001. El frontend contiene direcciones `localhost` fijas. El sistema usa nombres y formato monetario colombiano, pero no hay un campo de moneda por transacción: la moneda operativa debe acordarse con el negocio. Las horas del servidor influyen en cierres y reportes.

## Glosario

| Término | Significado |
| --- | --- |
| POS | Punto de venta para registrar pedidos y pagos |
| KDS | Pantalla de cocina para seguir la preparación |
| Comanda | Instrucción de preparación enviada a cocina, usualmente impresa |
| Receta | Ingredientes y cantidades asociados a un producto o preparación |
| Adicional | Extra con precio y, opcionalmente, consumo de un ingrediente |
| Exclusión | Nombre de ingrediente que no se utiliza en un producto vendido |
| Lote | Registro de producción de una preparación y sus insumos consumidos |
| Caja | Sesión de operación con base inicial, responsable y cierre |
| SSE | Canal HTTP de eventos enviados del servidor al navegador |
| FK / PK | Clave foránea / clave primaria |
| Auditoría | Registro de determinadas acciones, actor y entidad afectada |

## Fuentes

[README original](../README.md), [módulos del backend](../api/src/app.module.ts), [esquema de datos](../api/prisma/schema.prisma) y [navegación](../web/components/Navbar.tsx).
