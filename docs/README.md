# Documentación de PowerPOS Pioneers

> Actualización funcional 1.2: consultar [Tienda por empresa, domicilios y fidelización configurable](12-tiendas-domicilios-fidelizacion.md). Sustituye la regla fija de puntos de los manuales/PDF 1.1. Las nuevas funciones requieren aplicar la migración y desplegar la aplicación; la landing comercial es independiente.

Versión documental: 1.1 · Actualización: 16 de septiembre de 2026 · Idioma: español.

Este expediente describe el código disponible en el espacio de trabajo, incluidos cambios locales todavía no confirmados en Git. Se prepara para entrega académica, mantenimiento técnico y documentación de adquirentes; no constituye un acta de aceptación ni una certificación de funcionamiento en producción.

El [paquete para el cliente](cliente/README.md) contiene manual operativo, acta de entrega y procedimiento de soporte. Debe completarse con los datos reales de implantación antes de enviarlo como definitivo.

## Versiones listas para leer e imprimir

- [Expediente académico y técnico](entregables/documentacion-academica-tecnica.html).
- [Manual y soporte del cliente](entregables/manual-del-cliente.html).
- [Guía del piloto y entrega](entregables/guia-piloto-y-entrega.html).
- [Acta de entrega y aceptación](entregables/acta-de-entrega.html).

Abrir en navegador y usar **Imprimir o guardar como PDF**. El contenido y los diagramas están incorporados en los HTML y se leen sin conexión. Los enlaces a código y archivos editables requieren conservar la estructura del repositorio. Los SVG de [diagramas](diagramas/) permiten ampliar e imprimir cada modelo por separado.

## Contenido

| Documento | Contenido |
| --- | --- |
| [01. Presentación y alcance](01-presentacion-y-alcance.md) | Problema, justificación, objetivos, actores, límites y glosario |
| [02. Requerimientos](02-requerimientos.md) | Requerimientos funcionales, no funcionales, reglas y criterios de aceptación |
| [03. Casos de uso y procesos](03-casos-de-uso.md) | Flujos, excepciones, secuencia de venta y estados |
| [04. Arquitectura](04-arquitectura.md) | Componentes, tecnologías, comunicaciones y decisiones |
| [05. Modelo de datos](05-modelo-de-datos.md) | Diagramas entidad-relación por dominio y relaciones físicas |
| [06. Diccionario de datos](06-diccionario-de-datos.md) | Todos los modelos, campos, tipos, claves y enumeraciones de Prisma |
| [07. API](07-api.md) | Contratos principales y catálogo completo de rutas declaradas |
| [08. Instalación y operación](08-instalacion-y-operacion.md) | Configuración, ejecución, respaldos, despliegue y diagnóstico |
| [09. Manual de usuario](09-manual-de-usuario.md) | Operación por pantalla y rol |
| [10. Pruebas y trazabilidad](10-pruebas-y-trazabilidad.md) | Casos de prueba, cobertura documental y aceptación |
| [11. Brechas y evolución](11-brechas-y-evolucion.md) | Limitaciones comprobables y trabajo pendiente |

## Cómo interpretar los estados

- **Observado:** hay código que implementa la capacidad. No implica que se haya probado ejecutando el sistema.
- **Parcial:** existe una parte, pero hay una brecha concreta descrita.
- **Propuesto:** requisito o mejora pendiente de aprobación e implementación.
- **Pendiente de ejecución:** prueba diseñada, todavía sin resultado funcional.

La fuente principal es [schema.prisma](../api/prisma/schema.prisma), seguida de los controladores, servicios y páginas. El README anterior sirve como contexto, pero sus afirmaciones no sustituyen la evidencia del código. No se inspeccionaron archivos de secretos ni datos del respaldo SQL para elaborar este expediente.

## Diagramas y mantenimiento

Los diagramas están en Mermaid, embebidos en Markdown y como archivos editables en [diagramas](diagramas/). Pueden visualizarse en un lector compatible con Mermaid. El diagrama completo conserva todas las relaciones; los diagramas por dominio facilitan su lectura.

Desde la raíz del repositorio, ejecutar `node docs/tools/generar-referencias.mjs` después de cambiar Prisma o los controladores. Regenera modelo, diccionario y catálogo de rutas; los requerimientos y manuales se revisan manualmente. No modifica la aplicación ni la base de datos.

`node docs/tools/validar-documentacion.mjs` comprueba enlaces, modelos y trazabilidad explícita. Para reconstruir HTML/SVG, ejecutar `node docs/tools/exportar-html.cjs RUTA_NODE_MODULES` con dependencias de artefactos que contengan `marked` y `@viz-js/viz`; no requiere modificar dependencias de la aplicación.

## Datos de entrega pendientes

## PDF listos para entrega

- [Manual ilustrado del cliente](../output/pdf/manual-del-cliente.pdf): operación por pantalla, ejemplos y soporte.
- [Guía de piloto y entrega](../output/pdf/guia-piloto-y-entrega.pdf): procedimientos, capacitación, alcance y resultados de validación.
- [Acta de entrega](../output/pdf/acta-de-entrega.pdf): registro de alcance y aceptación por empresa.

## Personalización académica

Autor(es), institución, programa, asignatura, docente, ciudad, fecha de entrega y responsables de aprobación no fueron suministrados. Deben completarse si se requiere portada académica. No se inventaron entrevistas, encuestas, resultados de pruebas, métricas de rendimiento ni aprobaciones.

| Versión | Fecha | Cambio | Aprobación |
| --- | --- | --- | --- |
| 1.0 | 2026-09-15 | Primera documentación basada en código local | Pendiente del responsable del proyecto |
| 1.1 | 2026-09-16 | Manual ilustrado, procedimientos, piloto, capacitación y pruebas aisladas con resultados | Aceptación productiva pendiente |
