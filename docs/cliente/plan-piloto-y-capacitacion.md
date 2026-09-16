# Plan piloto y capacitación

Versión 1.1 · 16 de septiembre de 2026. El sistema se ofrecerá a varias empresas, comenzando con **una empresa piloto**. No se ha desplegado. Este plan organiza preparación, ensayo, aceptación y expansión sin asumir dirección pública ni compromisos comerciales.

## 1. Objetivo del piloto

Comprobar en una operación controlada que el personal puede registrar pedidos, preparar, cobrar, seguir existencias y conciliar caja con información consistente. Medir incidencias, tareas que requieren asistencia y adecuación de equipos/horarios. No usar el piloto como evidencia de aislamiento multiempresa: ese aspecto necesita pruebas específicas antes de incorporar otro negocio.

## 2. Alcance inicial recomendado

Incluir una empresa, sucursal o conjunto limitado acordado de puestos, catálogo revisado, usuarios individuales, POS, cocina, caja, ingredientes, clientes y consultas. Habilitar impresión solo después de probar equipo y red. Habilitar consumo interno después de capacitar al responsable.

Dejar fuera del alcance aceptado la emisión de factura electrónica no implementada, saldo real de preparaciones, logística de reparto, cobro bancario integrado y modo offline. Identificar separadamente las funciones disponibles en API pero sin flujo completo de interfaz.

## 3. Condiciones previas

| Control | Evidencia para avanzar | Responsable previsto |
| --- | --- | --- |
| Consistencia de venta y reintento | Pedido, stock, ingreso y puntos sin efectos parciales o duplicados ante fallo | Desarrollo |
| Cantidades y descuentos | Rechazo de entradas inválidas, incluidas cantidades cero | Desarrollo |
| Permisos | Cajero/cocinero no ejecutan administración no autorizada por API | Desarrollo y supervisor |
| Correcciones | Anulación/corrección probada con efectos definidos | Desarrollo y negocio |
| Caja | Criterio de cierre por medios y horario aceptados | Negocio y desarrollo |
| Catálogo | Precios, recetas, unidades y saldo inicial comprobados | Administrador |
| Instalación | URL, acceso, persistencia, hora y secretos cuando se despliegue | Proveedor |
| Equipos | Impresión, cajón, monitor y conectividad probados si se incluyen | Proveedor y negocio |
| Recuperación | Copia y restauración de ambiente de ensayo probadas | Operador técnico |
| Capacitación | Operadores completan ejercicios sin asistencia crítica | Facilitador |

Los defectos confirmados por la revisión no quedan cerrados por redactar este plan. Registrar su corrección y reprueba antes de aprobar el control correspondiente.

## 4. Fases y salidas

| Fase | Actividades | Evidencia de salida |
| --- | --- | --- |
| Preparación | Definir funciones, responsables, productos de ensayo y equipos | Ficha de alcance y lista de controles |
| Ensayo | Simular jornada sin datos de clientes reales ni cobros reales | Casos ejecutados y hallazgos |
| Capacitación | Practicar por rol con manual y fichas rápidas | Asistencia y ejercicios observados |
| Inicio controlado | Operar bajo supervisión después de cerrar bloqueos | Registro de incidencias y conciliación diaria |
| Evaluación | Comparar resultados, pendientes y condiciones acordadas | Acta con decisión de continuar, ajustar o suspender |
| Expansión | Verificar aislamiento y operación con varias empresas | Pruebas A/B aprobadas antes del segundo negocio |

Duración de fases y fechas se fijan con la empresa piloto. No se inventa una fecha de puesta en marcha.

## 5. Ejercicio guiado de capacitación

Datos de ensayo: producto a 10000, extra a 2000, receta de 1 pan y 10 gramos de cebolla, extra con 20 gramos de queso; existencias conocidas. No cargar este catálogo sobre datos reales sin un ambiente de ensayo.

1. Administrador verifica categoría, receta y adicional.
2. Supervisor abre caja de ensayo con base 50000 y cajero asignado.
3. Cajero arma dos productos con un extra cada uno y sin cebolla; asocia cliente sintético.
4. Comprueba total 24000 sin descuento y clasifica pago de prueba.
5. Cocina comprueba cantidad, exclusión y extra; inicia preparación y marca listo.
6. Supervisor registra entrega desde Dashboard.
7. Verificar 2 panes y 40 gramos de queso consumidos, cebolla no consumida y 24 puntos para cliente.
8. Revisar ingreso financiero y evitar duplicarlo manualmente.
9. Simular fallo de impresión sin repetir la venta y describir escalamiento.
10. Conciliar y cerrar según criterio validado, con registro de resultados.

Las pruebas automatizadas incluyeron un descuento técnico de 1000 y total 23000; el ejercicio de interfaz utiliza 24000 porque no se observó campo de descuento en POS. Mantener separados ambos escenarios evita enseñar controles inexistentes.

## 6. Programa de capacitación por rol

| Sesión | Participantes | Contenido | Evidencia de aprendizaje |
| --- | --- | --- | --- |
| Acceso y seguridad | Todos | Cuenta propia, empresa correcta, cierre de sesión y reporte | Ingreso/salida autónomos |
| Venta | Cajeros y supervisores | Caja, carrito, extras, exclusiones, cliente y pago | Pedido correcto sin duplicado |
| Cocina | Cocineros y supervisores | Lectura de comanda, estados y entrega | Modificaciones interpretadas correctamente |
| Administración | Administrador/gerente | Catálogo, receta, unidades, usuarios y sucursales | Producto y usuario de ensayo verificados |
| Inventario | Responsable de insumos | Entrada, salida, ajuste, conversión e historial | Conversión y conteo correctos |
| Cierre e incidentes | Cajero, gerente y soporte | Arqueo, venta incierta, contingencia y anulación | Caso de excepción documentado |
| Recuperación técnica | Operador designado | Copias, restauración y conciliación posterior | Evidencia de recuperación aislada |

Registro por sesión: fecha, duración real, facilitador, participantes, ejercicio, resultado, dudas y próxima acción. Los tiempos de capacitación no se consideran contratados hasta acordarlos.

## 7. Métricas del piloto

| Métrica | Cómo medir | Meta |
| --- | --- | --- |
| Operaciones consistentes | Pedidos cuyos detalles, stock, ingreso y puntos concilian | Acordar; cero inconsistencias críticas para aprobar |
| Pedidos duplicados por reintento | Casos confirmados por incidencia | Cero |
| Diferencias de caja | Valor y motivo por turno/medio | Todas explicadas y documentadas |
| Incidencias por jornada | Número, severidad y tiempo real de resolución | Comparar tendencia; sin SLA inventado |
| Autonomía del personal | Ejercicios completados sin ayuda | Flujos críticos completados |
| Recuperación | Tiempo y pérdida real medidos en prueba | Meta acordada antes de operación |

## 8. Criterios de suspensión y ampliación

Suspender el flujo afectado si se observan datos de otra empresa, ventas duplicadas/partidas, diferencias de caja inexplicables o pérdida de datos. Registrar evidencia y escalar; no continuar ocultando el problema mediante ajustes.

Antes de sumar la segunda empresa, verificar inventario separado, clientes/caja protegidos por empresa, roles efectivos, destinatarios de notificaciones correctos y pruebas cruzadas con IDs de ambas empresas. Usar bases separadas solo es una alternativa de despliegue que debe diseñarse y probarse; no se supone implementada por este manual.

## 9. Decisión final

Resultados posibles: continuar piloto, ampliar con condiciones, repetir ensayo o no aceptar. El acta debe identificar evidencias, defectos abiertos, responsables y decisión de negocio. La documentación no firma ni aprueba por las partes.
