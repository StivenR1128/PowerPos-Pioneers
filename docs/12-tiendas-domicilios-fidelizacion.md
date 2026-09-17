# Tienda por empresa, domicilios y fidelización configurable

Versión funcional 1.2 · 17 de septiembre de 2026. Complementa los manuales 1.1: las reglas de puntos fijas de esos documentos ya no son vigentes.

## Qué se incorpora

Cada empresa recibe automáticamente un identificador de tienda al crearse. Su página se sirve en `/tienda/{tiendaSlug}` dentro del mismo sitio de PowerPOS. No se crea un despliegue independiente por empresa. La migración asigna identificadores también a las empresas existentes.

La tienda muestra nombre y logo de la empresa, título, descripción, portada opcional, color, horario, catálogo, precios, disponibilidad y contacto. La vista inicial funciona para restaurantes, bares y comercios; no exige funciones de cocina para comprar.

## Administrador: publicar y alimentar la tienda

1. Entrar a **Mi tienda**. Copiar el enlace o personalizar su identificador con letras minúsculas, números y guiones. Cambiarlo invalida enlaces anteriores.
2. En **Configuración**, guardar nombre, logo, dirección y teléfono de la empresa.
3. En **Mi tienda**, escribir título, descripción y horario; elegir color y opcionalmente una portada HTTPS.
4. Registrar el WhatsApp de esa empresa con indicativo de país, solo números.
5. Administrar categorías, productos, imágenes y precios desde **Productos**. La tienda consulta ese mismo catálogo, sin copiar precios a otra base.
6. Seleccionar sucursal receptora, definir compra mínima y zonas con tarifas.
7. Activar **Recibir pedidos desde la web**. Por defecto la página existe, pero la recepción de pedidos permanece apagada hasta configurar su operación.

Las modificaciones las autoriza el servidor según empresa y rol. Solo ADMIN_EMPRESA configura tienda y fidelización; el catálogo mantiene administración por administrador/gerente. Los precios públicos se consultan al cargar la página. Al enviar y aceptar se vuelven a comprobar en el servidor.

## Comprador: realizar un pedido

1. Abrir la tienda, buscar o filtrar productos y agregarlos al carrito.
2. Indicar nombre, teléfono, dirección, zona, forma de pago e instrucciones.
3. Revisar productos, tarifa y total, y autorizar el uso de esos datos para gestionar el domicilio.
4. Enviar. El servidor obtiene los precios de su catálogo; no utiliza precios enviados por el navegador.
5. Recibir una referencia y un enlace con `?pedido=...` que permite recuperar el seguimiento al recargar. No compartir ese enlace innecesariamente.

La solicitud no acredita un pago ni crea una venta hasta que el cajero la acepte. No se incorporó una pasarela de pagos. EFECTIVO, TRANSFERENCIA, NEQUI y DAVIPLATA son medios declarados que el negocio debe verificar.

**WhatsApp:** abre una conversación con los productos y el subtotal propuestos. No envía mensajes automáticamente ni sincroniza conversaciones con PowerPOS. El personal registra y confirma esos pedidos por su procedimiento habitual; una integración automática con WhatsApp Business requeriría credenciales y configuración adicionales.

## Cajero y domiciliario

La navegación del cajero muestra el número de solicitudes pendientes, consultado cada cinco segundos. **Domicilios** permite revisar datos, productos, total e instrucciones. El cajero ve solo su sucursal; administrador/gerente pueden revisar su empresa.

| Estado | Acción y efecto |
| --- | --- |
| RECIBIDO | Solicitud pendiente. No afecta inventario, caja, ingresos ni puntos. |
| RECHAZADO | El cajero indica un motivo. No crea una venta. |
| ACEPTADO | El cajero verifica el pedido y el medio de pago. Con caja abierta, se crea una sola venta, sus detalles, inventario, ingreso y puntos en una transacción. |
| EN_CAMINO | Se asigna un usuario DOMICILIARIO activo de la misma empresa y se despacha. |
| ENTREGADO | El domiciliario asignado o el personal autorizado confirma la entrega y se actualiza también el pedido del POS. |

El domiciliario inicia sesión en **Domicilios** y solo ve sus asignaciones. Dos aceptaciones simultáneas no producen dos ventas. Un fallo de la aceptación revierte todos sus cambios. Si el catálogo cambió respecto de la solicitud, se debe contactar al comprador antes de tramitar una nueva solicitud con el precio correcto.

La cocina puede avanzar la preparación, pero la entrega de pedidos web se confirma desde Domicilios. Rechazar una solicitud pendiente no equivale a anular una venta aceptada. Las cancelaciones posteriores a aceptación y ventas con movimientos de puntos requieren conciliación; no se implementó un flujo automático de devoluciones/reembolsos.

## Fidelización: dos valores definidos por cada empresa

Por decisión del responsable del proyecto, no existe una tarifa obligatoria ni se conserva como regla activa «1 punto por cada $1.000». El programa comienza **desactivado**, con ambos valores sin definir, y conserva los saldos históricos existentes.

En **Puntos**, el ADMIN_EMPRESA define:

- Compra elegible necesaria para ganar un punto, en COP.
- Descuento en COP que representa un punto al canjearlo.
- Categorías que no generan puntos.
- Productos que no generan puntos.

Las exclusiones se suman. Las subcategorías se seleccionan individualmente; excluir una categoría no excluye automáticamente sus hijas. Los adicionales siguen la elegibilidad de su producto principal. Los descuentos se distribuyen proporcionalmente entre las líneas. El domicilio no genera puntos ni puede pagarse con ellos. Se redondea la acumulación hacia abajo al punto entero.

**Ejemplo exclusivamente de prueba, no tarifa recomendada:** reglas de $1.000 por punto y $100 de descuento por punto. Una venta de comida por $20.000 y bebidas excluidas por $10.000 acumula 20 puntos. Canjear 10 puntos descuenta $1.000; la porción de descuento correspondiente a la comida reduce la base elegible y la venta acumula 19 puntos.

En POS, seleccionar un cliente identificado, indicar puntos a canjear y revisar el descuento. El backend verifica el saldo, registra puntos ganados/canjeados y valor aplicado en el pedido, y actualiza el saldo en la misma transacción. El canje aislado anterior en Clientes se reemplaza por canje dentro de la venta. Los ajustes positivos manuales quedan reservados al administrador.

Los compradores públicos no pueden reclamar un saldo por indicar un teléfono. Para acumular puntos en pedidos web, el cajero verifica su identidad y asocia el cliente correcto al aceptar. No se habilita consulta ni canje público de saldos sin autenticación del cliente.

Cambiar el valor monetario afecta los canjes futuros del saldo existente; no cambia los descuentos ni puntos guardados en ventas anteriores.

## Activación técnica

1. Respaldar la base real antes de migrar.
2. En `api`, ejecutar `npx prisma migrate deploy` y `npx prisma generate`, luego compilar y reiniciar la API.
3. Antes de compilar `web`, definir `NEXT_PUBLIC_API_URL` con la URL HTTPS pública de la API. Si se omite, se conserva el destino local `http://localhost:3000` para desarrollo.
4. Compilar/reiniciar la aplicación web. La tienda vive en ese despliegue, no en la landing comercial de Sites.
5. Verificar las URLs de logos e imágenes. Un enlace `localhost` no será accesible para compradores remotos.
6. Configurar sucursal, zonas, WhatsApp, recepción de pedidos y reglas de fidelización desde el panel.

La migración `20260916070000_tienda_domicilios_fidelizacion` se probó primero en PostgreSQL aislado y luego se aplicó satisfactoriamente en la base local `powerpos_dev` el 17 de septiembre de 2026. Antes se creó y se comprobó el catálogo del respaldo `backups/powerpos_pre_tienda_20260917.dump` (fuera de Git). No se desplegó en un entorno público. En otras instalaciones deben seguirse los pasos anteriores; en esta base local no es necesario repetir la migración.

## Validación y límites

Prueba reproducible: `api/test/tienda-integracion.cjs`. Exige `TIENDA_TEST_DATABASE_URL` apuntando exactamente a `127.0.0.1:55439/powerpos_store_test`; rechaza otro destino. Requiere migraciones y backend compilado. Crea empresas y usuarios sintéticos; no borra información.

Resultado: 15 escenarios HTTP satisfactorios con PostgreSQL aislado: catálogo aislado, roles, manipulación de precios, reintentos, caja cerrada, aceptación concurrente, entrega, exclusiones de puntos, canje proporcional, saldo concurrente y rechazo sin venta. Las dos pruebas existentes del backend también pasan. API y aplicación web compilan con sus nuevas rutas. En navegador se verificó envío desde el carrito, recuperación del seguimiento tras recargar, aparición en la bandeja, pantallas de configuración y vista móvil sin desbordamientos ni errores JavaScript.

La protección inicial contra abuso usa un límite en memoria por IP y uno persistente por teléfono/empresa. Para varios servidores debe añadirse un límite distribuido en el despliegue. Las zonas son seleccionadas por el cliente y revisadas por el cajero; no hay geocodificación ni cálculo automático de distancias. No se reserva inventario durante la solicitud pendiente. La tienda utiliza cantidades enteras; no incorpora integración de básculas ni lectores como parte de esta entrega.

Las brechas históricas de inventario global y conciliaciones descritas en la documentación 1.1 no se consideran corregidas por este módulo. La activación productiva requiere revisar esos pendientes y ejecutar el piloto.
