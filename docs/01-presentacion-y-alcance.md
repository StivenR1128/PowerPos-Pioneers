# 01. Presentación y alcance

## Identificación

**Nombre:** PowerPOS Pioneers. **Tipo:** aplicación web de punto de venta y gestión comercial con orientación SaaS multiempresa. **Usuarios previstos:** restaurantes, bares, supermercados y otros comercios con requerimientos POS. Esta caracterización procede del README y los módulos implementados; no es el resultado de un estudio de mercado.

## Problema y justificación

La operación gastronómica necesita mantener relacionados los pedidos, sus modificaciones, la preparación en cocina, las existencias de ingredientes y los ingresos del negocio. Llevar estos procesos en registros separados dificulta rastrear qué se vendió, qué se consumió y quién intervino. PowerPOS centraliza esas actividades y ofrece pantallas según el trabajo de caja, cocina y administración.

Se espera reducir errores de transcripción y facilitar el seguimiento operativo. Estos beneficios son objetivos del proyecto; no se dispone de mediciones que permitan cuantificar una mejora frente al proceso anterior.

## Objetivo general

Desarrollar y mantener una plataforma web que integre ventas, preparación, caja, inventario y seguimiento administrativo de empresas, con usuarios autenticados y separación de información por empresa.

## Objetivos específicos

1. Registrar pedidos con cantidades, exclusiones de ingredientes, adicionales y método de pago.
2. Comunicar pedidos a cocina y registrar su estado de preparación y entrega.
3. Relacionar ventas con caja, cliente, vendedor y movimientos financieros.
4. Administrar productos, categorías, recetas, ingredientes y preparaciones por lotes.
5. Ofrecer reportes operativos y seguimiento de consumo interno.
6. Gestionar empresas, sucursales, usuarios y capacidades habilitadas.
7. Establecer documentación, criterios de aceptación y una ruta de mejora verificable.

## Alcance observado

Tienda web automática por empresa, catálogo público, solicitudes de domicilio, bandeja de cajero, asignación y seguimiento de entregas; fidelización configurable por empresa. Autenticación JWT; catálogo y categorías jerárquicas; recetas de ingredientes; adicionales; pedidos; cocina; caja y eventos; inventario y ajustes; preparaciones y lotes; clientes y puntos; ingresos y egresos; reportes; impresión ESC/POS; notificaciones; configuración; superadministración; auditoría de determinadas operaciones; consumo de empleados; pantalla de cliente y llamado.

La separación multiempresa es **parcial**: ingredientes y movimientos de inventario no tienen un propietario empresarial directo; algunos accesos por identificador tampoco filtran empresa. La existencia de planes y permisos no demuestra restricciones completas en el servidor.

## Fuera del alcance implementado identificado

- Emisión completa de factura electrónica: se encontró una bandera de configuración, no un módulo de emisión.
- Procesamiento bancario de pagos: los métodos de pago se registran, sin pasarela identificada.
- Contabilidad de partida doble, liquidación de nómina o cuentas por pagar. `NOMINA` es una categoría de egreso.
- Operación sin conexión y sincronización posterior.
- Optimización de rutas y geocodificación: hay asignación/seguimiento de domicilios, sin cálculo de rutas o distancias.
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

El navegador accede a una API central y esta a PostgreSQL. El entorno local usa API en 3000 y frontend en 3001. El cliente HTTP principal y la tienda usan `NEXT_PUBLIC_API_URL`; quedan referencias locales de SSE/impresión por revisar antes del despliegue. El sistema usa nombres y formato monetario colombiano, pero no hay un campo de moneda por transacción: la moneda operativa debe acordarse con el negocio. Las horas del servidor influyen en cierres y reportes.

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

## Tienda, entrega y presencia comercial

Cada empresa obtiene una página en `/tienda/{slug}` con su marca y productos. Su catálogo se mantiene desde el POS. La landing de `landing/` promociona PowerPOS; las tiendas se sirven desde la aplicación Next.js y requieren el despliegue de API y web. Se ofrece a restaurantes, bares, supermercados y comercios, con alcance específico verificado durante la demo.

La empresa define cuánto comprar para ganar un punto y cuánto descuento representa al canjearlo. El programa inicia desactivado, conserva los saldos anteriores y permite excluir categorías y productos. La base elegible recibe su parte proporcional de los descuentos; domicilio excluido y redondeo hacia abajo. No hay valor obligatorio.
