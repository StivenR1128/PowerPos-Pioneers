// Pruebas reproducibles con base descartable. No importa AppModule ni inicia cron.
// Ejecutar después de compilar api y migrar una base llamada powerpos_docs_test.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const { PrismaClient } = require(path.join(root, 'api/node_modules/@prisma/client'));
const bcrypt = require(path.join(root, 'api/node_modules/bcrypt'));
const { JwtService } = require(path.join(root, 'api/node_modules/@nestjs/jwt'));
const url = process.env.DOCS_TEST_DATABASE_URL;
if (!url) throw new Error('Falta DOCS_TEST_DATABASE_URL. No se usa DATABASE_URL ni .env.');
const parsed = new URL(url);
if (parsed.hostname !== '127.0.0.1' || parsed.port !== '55439' || parsed.pathname !== '/powerpos_docs_test') throw new Error('Destino rechazado: únicamente base documental aislada en 127.0.0.1:55439.');
const prisma = new PrismaClient({ datasources: { db: { url } } });
const service = (module, name, ...args) => new (require(path.join(root, `api/dist/src/${module}.js`))[name])(...args);
const events = [];
const silent = { enviarAlerta: async () => undefined };
const auditoria = { registrar: (data) => prisma.auditoria.create({ data }) };
const pedidos = service('pedidos/pedidos.service', 'PedidosService', prisma, { emitir: (empresaId, evento) => events.push({ empresaId, evento }) }, silent);
const caja = service('caja/caja.service', 'CajaService', prisma, silent);
const inventario = service('inventario/inventario.service', 'InventarioService', prisma, silent);
const consumo = service('consumo-empleados/consumo-empleados.service', 'ConsumoEmpleadosService', prisma, auditoria);
const preparaciones = service('preparaciones/preparaciones.service', 'PreparacionesService', prisma);
const auth = service('auth/auth.service', 'AuthService', prisma, new JwtService({ secret: 'SOLO_PRUEBA_DOCUMENTAL', signOptions: { expiresIn: '8h' } }));
const resultados = [];
async function check(id, nombre, run) {
  try { const detalle = await run(); resultados.push({ id, nombre, estado: 'APROBADO', detalle: detalle || 'Resultado esperado comprobado.' }); }
  catch (e) { resultados.push({ id, nombre, estado: 'FALLIDO', detalle: String(e.message).slice(0, 1200) }); }
}
async function gap(id, nombre, run) {
  try { const detalle = await run(); resultados.push({ id, nombre, estado: 'BRECHA CONFIRMADA', detalle }); }
  catch (e) { resultados.push({ id, nombre, estado: 'NO REPRODUCIDO', detalle: String(e.message).slice(0, 1200) }); }
}
async function main() {
  await prisma.$connect();
  if (await prisma.empresa.count()) throw new Error('Se requiere base vacía. No se borran datos automáticamente.');
  const hash = await bcrypt.hash('ClaveSoloPruebas123!', 4);
  const a = await prisma.empresa.create({ data: { nombre: 'Empresa documental A', nit: 'DOCS-A', email: 'a@example.invalid', consumoEmpleadosHabilitado: true } });
  const b = await prisma.empresa.create({ data: { nombre: 'Empresa documental B', nit: 'DOCS-B', email: 'b@example.invalid' } });
  const sucursal = await prisma.sucursal.create({ data: { empresaId: a.id, nombre: 'Sucursal de prueba A' } });
  const sucursalB = await prisma.sucursal.create({ data: { empresaId: b.id, nombre: 'Sucursal de prueba B' } });
  const user = await prisma.usuario.create({ data: { empresaId: a.id, sucursalId: sucursal.id, nombre: 'Cajero de prueba', email: 'cajero@example.invalid', password: hash, rol: 'CAJERO' } });
  const userB = await prisma.usuario.create({ data: { empresaId: b.id, sucursalId: sucursalB.id, nombre: 'Otro cajero', email: 'otro@example.invalid', password: hash, rol: 'CAJERO' } });
  const categoria = await prisma.categoria.create({ data: { empresaId: a.id, nombre: 'Pruebas' } });
  const pan = await prisma.ingrediente.create({ data: { nombre: 'Pan prueba', unidad: 'unidad', stock: 100, stockMinimo: 5 } });
  const cebolla = await prisma.ingrediente.create({ data: { nombre: 'Cebolla prueba', unidad: 'gramos', stock: 1000, stockMinimo: 50 } });
  const queso = await prisma.ingrediente.create({ data: { nombre: 'Queso prueba', unidad: 'gramos', stock: 1000, stockMinimo: 50 } });
  const adicional = await prisma.adicional.create({ data: { empresaId: a.id, nombre: 'Extra queso', precio: 2000, ingredienteId: queso.id, cantidad: 20 } });
  const producto = await prisma.producto.create({ data: { empresaId: a.id, categoriaId: categoria.id, nombre: 'Hamburguesa prueba', precio: 10000, ingredientes: { create: [{ ingredienteId: pan.id, cantidad: 1 }, { ingredienteId: cebolla.id, cantidad: 10 }] }, adicionales: { create: { adicionalId: adicional.id } } } });
  const cliente = await prisma.cliente.create({ data: { empresaId: a.id, nombre: 'Cliente sintético', documento: 'DOC-001' } });
  const datos = { sucursalId: sucursal.id, clienteId: cliente.id, metodoPago: 'EFECTIVO', descuento: 1000, items: [{ productoId: producto.id, cantidad: 2, exclusiones: ['Cebolla prueba'], adicionales: [{ adicionalId: adicional.id, cantidad: 1 }] }] };
  let venta;
  await check('AT-01', 'Login válido e inválido', async () => {
    const result = await auth.login(user.email, 'ClaveSoloPruebas123!'); assert.ok(result.access_token); assert.equal(result.usuario.rol, 'CAJERO');
    await assert.rejects(() => auth.login(user.email, 'incorrecta'), /Credenciales inválidas/);
  });
  await check('AT-02', 'Rechazo de venta sin caja', async () => { await assert.rejects(() => pedidos.crearPedido(datos, user.id, a.id), /abrir la caja/); assert.equal(await prisma.pedido.count(), 0); });
  await check('AT-03', 'Apertura y rechazo de segunda caja', async () => { await caja.abrirCaja({ montoInicial: 50000, cajeroId: user.id }, user.id, sucursal.id, a.id); await assert.rejects(() => caja.abrirCaja({ montoInicial: 0 }, user.id, sucursal.id, a.id), /Ya existe/); });
  await check('AT-04', 'Venta con adicionales, exclusión, ingreso y puntos', async () => {
    venta = await pedidos.crearPedido(datos, user.id, a.id);
    assert.equal(Number(venta.subtotal), 24000); assert.equal(Number(venta.total), 23000);
    assert.equal(Number((await prisma.ingrediente.findUnique({ where: { id: pan.id } })).stock), 98);
    assert.equal(Number((await prisma.ingrediente.findUnique({ where: { id: cebolla.id } })).stock), 1000);
    assert.equal(Number((await prisma.ingrediente.findUnique({ where: { id: queso.id } })).stock), 960);
    assert.equal((await prisma.cliente.findUnique({ where: { id: cliente.id } })).puntos, 23);
    assert.equal(Number((await prisma.movimientoFinanciero.findFirst({ where: { pedidoId: venta.id } })).monto), 23000);
    assert.equal(events.at(-1).evento.tipo, 'CREADO');
    return 'Subtotal 24000; total 23000; pan 98; cebolla 1000; queso 960; puntos 23; ingreso 23000; evento emitido.';
  });
  await check('AT-05', 'Pedido ajeno no consultable por PedidosService', async () => { await assert.rejects(() => pedidos.obtenerPedido(venta.id, b.id), /no encontrado/); });
  await check('AT-06', 'Cambio de estado y evento', async () => { const result = await pedidos.actualizarEstado(venta.id, 'EN_COCINA', a.id); assert.equal(result.estado, 'EN_COCINA'); assert.equal(events.at(-1).evento.tipo, 'ACTUALIZADO'); });
  await check('AT-07', 'Consumo interno sin ingreso financiero', async () => {
    const before = await prisma.movimientoFinanciero.count();
    await consumo.crear({ sucursalId: sucursal.id, empleadoNombre: 'Empleado sintético', items: [{ productoId: producto.id, cantidad: 1 }] }, user.id, a.id);
    assert.equal(await prisma.movimientoFinanciero.count(), before);
    assert.equal(Number((await prisma.ingrediente.findUnique({ where: { id: pan.id } })).stock), 97);
    await assert.rejects(() => consumo.crear({ sucursalId: sucursalB.id, empleadoNombre: 'Prueba', items: [{ productoId: producto.id, cantidad: 1 }] }, userB.id, b.id), /no tiene habilitado/);
    return 'Sin ingreso; stock descontado; empresa sin habilitación rechazada. Rol HTTP no probado en esta invocación directa.';
  });
  await check('AT-08', 'Entrada y conversión de inventario', async () => {
    const ing = await inventario.crearIngrediente({ nombre: 'Prueba conversión', unidad: 'gramos', stock: 1000, stockMinimo: 10, unidadCompra: 'bolsa', factorConversion: 500 }, user.id);
    const result = await inventario.ajustarStock(ing.id, { tipo: 'ENTRADA', cantidad: 2, enUnidadCompra: true, descripcion: 'Prueba aislada' }, user.id);
    assert.equal(result.stockNuevo, 2000); assert.equal((await inventario.obtenerHistorial(ing.id)).length, 2);
  });
  await check('AT-09', 'Preparación y lote', async () => {
    const prep = await preparaciones.crear({ nombre: 'Preparación de prueba', ingredientes: [] }, a.id, user.id);
    await preparaciones.crearLote(prep.id, { cantidadProducida: 10, porcionesTotales: 10, ingredientes: [{ ingredienteId: cebolla.id, cantidadUsada: 50 }] }, a.id, user.id);
    assert.equal((await preparaciones.obtener(prep.id, a.id)).porcionesDisponibles, 10);
    return 'Lote creado con 10 porciones y consumo de insumo. No verifica descuento de porciones por venta.';
  });
  await gap('AT-10', 'Anulación sin reversión', async () => {
    const stock = Number((await prisma.ingrediente.findUnique({ where: { id: pan.id } })).stock);
    await pedidos.actualizarEstado(venta.id, 'ANULADO', a.id);
    assert.equal(Number((await prisma.ingrediente.findUnique({ where: { id: pan.id } })).stock), stock);
    assert.equal((await prisma.cliente.findUnique({ where: { id: cliente.id } })).puntos, 23);
    assert.equal(await prisma.movimientoFinanciero.count({ where: { pedidoId: venta.id } }), 1);
    return 'Cambió a ANULADO y mantuvo stock consumido, 23 puntos e ingreso. No cumple reversión integral.';
  });
  await gap('AT-11', 'Validación de cantidad cero', async () => {
    const p = await pedidos.crearPedido({ sucursalId: sucursal.id, items: [{ productoId: producto.id, cantidad: 0 }] }, user.id, a.id);
    assert.equal(p.detalles[0].cantidad, 0);
    return 'Se aceptó pedido con cantidad cero. Falta rechazo de entrada inválida.';
  });
  await gap('AT-12', 'Stock global de inventario', async () => {
    const listado = await inventario.listarIngredientes(); assert.ok(listado.some((i) => i.id === pan.id));
    return 'El servicio lista inventario sin parámetro de empresa; sus resultados incluyen los insumos del escenario A. No demuestra aislamiento por negocio.';
  });
  await check('AT-13', 'Cierre con diferencia y evento', async () => {
    const abierta = await caja.obtenerCajaAbierta(sucursal.id);
    const result = await caja.cerrarCaja(abierta.id, { montoFinal: 52000 }, user.id);
    assert.equal(result.estado, 'CERRADA'); assert.equal(result.diferencia, 2000);
    assert.ok((await caja.obtenerAlertas(sucursal.id)).some((e) => e.tipo === 'DIFERENCIA'));
    return 'Pedido de 23000 anulado excluido del cierre; pedido de cero no aporta; base 50000, final 52000, diferencia 2000.';
  });
  fs.mkdirSync(path.join(root, 'docs/referencias'), { recursive: true });
  const report = { fecha: new Date().toISOString(), alcance: 'Servicios reales y PostgreSQL aislado. Sin AppModule, cron, SMTP, Twilio ni hardware. No prueba autorización HTTP ni concurrencia.', resultados };
  fs.writeFileSync(path.join(root, 'docs/referencias/resultados-aceptacion.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (resultados.some((r) => r.estado === 'FALLIDO')) process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
