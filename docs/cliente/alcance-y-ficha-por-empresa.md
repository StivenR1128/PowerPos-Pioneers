# Alcance y ficha por empresa

Plantilla reutilizable, versión 1.2. Crear una copia por adquirente cuando se concrete la implantación. Para el piloto actual no existe despliegue ni cliente identificado en este expediente; no es necesario inventar esos datos para usar el manual de capacitación.

## Estado del producto y de la entrega

| Elemento | Estado documentado |
| --- | --- |
| Modalidad prevista | Oferta a varias empresas |
| Primera etapa | Piloto en una sola empresa |
| Despliegue / URL | Todavía no desplegado; se asignará al implantar |
| Datos de demostración | Sintéticos, identificados como DEMO |
| Pruebas documentales | Unitarias y servicios con PostgreSQL aislado; ver informe |
| Aprobación productiva | Pendiente de correcciones y aceptación del piloto |

## Ficha de implantación futura

Registrar al iniciar un cliente: identificador de empresa, razón/nombre comercial, responsable operativo, locales incluidos, puestos de caja y cocina, equipos, modalidad de alojamiento, versión del software y manual, URL, moneda, zona horaria, horario de caja, canales de soporte y responsables de copias. Mantener contraseñas fuera de la ficha.

| Función | Disponible en código | Contratada por empresa | Probada en instalación |
| --- | --- | --- | --- |
| POS con extras y exclusiones | Sí, con pendientes de validación/consistencia | Por seleccionar | Pendiente |
| Cocina KDS | Sí | Por seleccionar | Pendiente |
| Caja y eventos | Sí; criterio de arqueo por acordar | Por seleccionar | Pendiente |
| Catálogo y recetas | Sí | Por seleccionar | Pendiente |
| Inventario | Sí, global; aislamiento pendiente | Por seleccionar | Pendiente |
| Clientes y puntos | Sí; reglas configurables y controles por empresa en rutas de clientes | Por seleccionar | Pendiente |
| Finanzas y reportes | Sí | Por seleccionar | Pendiente |
| Usuarios y sucursales | Sí; autorización integral pendiente | Por seleccionar | Pendiente |
| Impresión/cajón | Implementación TCP; requiere equipo | Por seleccionar | Pendiente |
| Pantalla del cliente/llamado | Sí, comunicación local del navegador | Por seleccionar | Pendiente |
| Consumo staff | Sí, con habilitación | Por seleccionar | Pendiente |
| Notificaciones | Integración opcional | Por seleccionar | Pendiente |
| Preparaciones/lotes | Parcial; saldo de porciones no completo | Delimitar expresamente | Pendiente |
| Facturación electrónica | Emisión no implementada identificada | No ofrecer como lista | No aplica |

Los nombres BASICO, MEDIUM y PREMIUM son valores del sistema. Este documento no asigna precios, límites de usuarios/sucursales ni garantías a esos planes porque no se han acordado comercialmente.

## Qué recibe cada empresa

Manual ilustrado y guía rápida; procedimientos; capacitación acordada; ficha de funciones; canales de soporte; acta con pruebas del ambiente y versión. Entregar anexos técnicos/código solo si forman parte del acuerdo. La copia del cliente no debe incluir claves, archivos .env ni respaldos reales.

## Control de cambios

Registrar versión entregada, módulos añadidos/retirados, fecha de capacitación adicional, cambios de horario/equipos y resultados de reprueba. La actualización del manual debe acompañar cambios que alteren instrucciones de operación.

## Alcance adicional 1.2 por confirmar con la empresa

| Capacidad o dato | Valor acordado / evidencia |
| --- | --- |
| Enlace público de la tienda y marca | ____________________ |
| Sucursal receptora, horarios y revisión | ____________________ |
| Zonas, tarifas, pedido mínimo y cobro | ____________________ |
| WhatsApp propio; sin importación automática | ____________________ |
| Domiciliarios y flujo de entrega | ____________________ |
| Compra elegible para ganar un punto | ____________________ |
| Descuento por punto canjeado | ____________________ |
| Categorías/productos excluidos y vigencia | ____________________ |
| Prueba web → cajero → domiciliario → entregado | ____________________ |
| Cancelaciones y devoluciones pendientes informadas | ____________________ |
