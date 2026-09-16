// Pantallas reales con respuestas sintéticas interceptadas en un navegador aislado.
// Ninguna petición a la API real puede salir de este contexto.
const fs = require('node:fs');
const path = require('node:path');
const deps = process.argv[2];
if (!deps) throw new Error('Indique directorio de dependencias con playwright.');
const { chromium } = require(path.join(deps, 'playwright'));
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'docs/cliente/capturas');
fs.mkdirSync(out, { recursive: true });
const now = new Date().toISOString();
const empresa = { id: 9001, nombre: 'Restaurante Piloto DEMO', nit: 'DEMO-001', email: 'piloto@example.invalid', telefono: 'No es un contacto real', logo: null, plan: 'PREMIUM', modoPreparacion: 'KDS', consumoEmpleadosHabilitado: true, permisos: {} };
const usuario = { id: 9001, nombre: 'Administradora DEMO', email: 'admin@example.invalid', rol: 'ADMIN_EMPRESA', empresa: empresa.nombre, empresaId: empresa.id, sucursalId: 9001, sucursal: 'Sucursal piloto DEMO', consumoEmpleadosHabilitado: true, permisos: {}, activo: true };
const users = [usuario, { ...usuario, id: 9002, nombre: 'Cajera DEMO', email: 'caja@example.invalid', rol: 'CAJERO' }];
const sucursales = [{ id: 9001, empresaId: empresa.id, nombre: 'Sucursal piloto DEMO', direccion: 'Dirección de ejemplo', telefono: '', activo: true }];
const categorias = [{ id: 9001, nombre: 'Hamburguesas', icono: '🍔', color: '#FF6B35', parentId: null, subcategorias: [] }, { id: 9002, nombre: 'Bebidas', icono: '🥤', color: '#3b82f6', parentId: null, subcategorias: [] }];
const ingredientes = [{ id: 9001, nombre: 'Pan', unidad: 'unidad', stock: '100', stockMinimo: '10', costoUnitario: '1000', factorConversion: null, unidadCompra: null, activo: true, stockBajo: false, stockCritico: false, movimientos: [], productos: [] }, { id: 9002, nombre: 'Cebolla', unidad: 'gramos', stock: '1000', stockMinimo: '200', costoUnitario: '2', activo: true, stockBajo: false, stockCritico: false, movimientos: [], productos: [] }, { id: 9003, nombre: 'Queso', unidad: 'gramos', stock: '100', stockMinimo: '200', costoUnitario: '10', activo: true, stockBajo: true, stockCritico: true, movimientos: [], productos: [] }];
const adicionales = [{ id: 9001, nombre: 'Extra queso', precio: '2000', ingredienteId: 9003, cantidad: '20', ingrediente: ingredientes[2], activo: true, disponible: true }];
const productos = [{ id: 9001, nombre: 'Hamburguesa clásica', descripcion: 'Producto de demostración', precio: '10000', categoriaId: 9001, categoria: categorias[0], activo: true, disponible: true, aceptaAdicionales: true, ingredientes: [{ ingredienteId: 9001, ingrediente: ingredientes[0], cantidad: '1' }, { ingredienteId: 9002, ingrediente: ingredientes[1], cantidad: '10' }], adicionales: [{ adicionalId: 9001, adicional: adicionales[0] }] }, { id: 9002, nombre: 'Limonada', descripcion: 'Bebida de demostración', precio: '5000', categoriaId: 9002, categoria: categorias[1], activo: true, disponible: true, aceptaAdicionales: false, ingredientes: [], adicionales: [] }];
const clientes = [{ id: 9001, nombre: 'Cliente DEMO', documento: 'DEMO-CLI-01', telefono: '', email: 'cliente@example.invalid', direccion: '', puntos: 24, activo: true, fechaNacimiento: null }];
const pedido = { id: 9001, numero: 'DEMO-001', estado: 'PENDIENTE', subtotal: '24000', descuento: '0', total: '24000', metodoPago: 'EFECTIVO', creadoEn: now, usuario: users[1], cliente: clientes[0], sucursal: sucursales[0], detalles: [{ id: 9001, producto: productos[0], cantidad: 2, precioUnitario: '10000', subtotal: '24000', exclusiones: ['Cebolla'], observacion: 'Para llevar', adicionales: [{ nombre: 'Extra queso', cantidad: 1, precio: '2000', subtotal: '4000' }] }] };
let cajaAbierta = true;
let loginRole = 'ADMIN_EMPRESA';
const resumen = { totalIngresos: 24000, totalEgresos: 5000, utilidad: 19000, totalVentasHoy: 24000, cantidadPedidosHoy: 1, porCategoria: { VENTA: { ingreso: 24000, egreso: 0 }, COMPRA_INSUMOS: { ingreso: 0, egreso: 5000 } } };
const estadisticas = { totalHoy: 24000, pedidosHoy: 1, totalHistorico: 24000, pedidosHistoricos: 1, ventasPorDia: [{ dia: 'Hoy', total: 24000 }], ventasPorMes: [{ mes: 'Septiembre', total: 24000 }], productosMasVendidos: [{ nombre: productos[0].nombre, cantidad: 2 }], ventasPorMetodoPago: [{ metodo: 'EFECTIVO', total: 24000 }], ventasPorCategoria: [{ categoria: 'Hamburguesas', total: 24000 }] };
function response(url) {
  const p = url.pathname;
  if (p === '/empresa') return empresa;
  if (p === '/usuarios/mi-perfil') return usuario;
  if (p === '/usuarios') return users;
  if (p === '/sucursales') return sucursales;
  if (p === '/categorias') return categorias;
  if (p === '/productos') return productos;
  if (p === '/adicionales') return adicionales;
  if (p === '/inventario') return ingredientes;
  if (p.endsWith('/historial')) return [{ id: 9001, tipo: 'ENTRADA', cantidadMovida: '100', stockAnterior: '0', stockNuevo: '100', descripcion: 'Carga inicial DEMO', usuario, creadoEn: now }];
  if (p === '/preparaciones') return [{ id: 9001, nombre: 'Salsa de la casa DEMO', unidad: 'porciones', descripcion: 'Ejemplo de preparación', porcionesDisponibles: 10, ingredientes: [], lotes: [] }];
  if (p === '/clientes') return clientes;
  if (p.startsWith('/clientes/')) return { ...clientes[0], pedidos: [pedido], totalGastado: 24000, totalPedidos: 1 };
  if (p === '/pedidos/estadisticas') return estadisticas;
  if (p === '/pedidos') return [pedido];
  if (p === '/caja/abierta') return cajaAbierta ? { id: 9001, usuarioId: 9002, estado: 'ABIERTA', montoInicial: '50000', totalVentas: 24000, totalEsperado: 74000, abiertaEn: now, usuario: users[1], sucursal: sucursales[0], pedidos: [pedido] } : null;
  if (p === '/caja/alertas' || p === '/caja/eventos') return [];
  if (p === '/financiero/resumen') return resumen;
  if (p === '/financiero/movimientos') return [{ id: 9001, tipo: 'INGRESO', categoria: 'VENTA', descripcion: 'Venta DEMO-001', monto: '24000', fecha: now, usuario: users[1], pedido }, { id: 9002, tipo: 'EGRESO', categoria: 'COMPRA_INSUMOS', descripcion: 'Compra demostrativa', monto: '5000', fecha: now, usuario, pedido: null }];
  if (p === '/reportes/empleados') return [{ nombre: users[1].nombre, cantidadPedidos: 1, ticketPromedio: 24000, totalVentas: 24000 }];
  if (p === '/reportes/clientes') return [{ ...clientes[0], totalGastado: 24000, totalCompras: 24000, cantidadPedidos: 1, totalPedidos: 1 }];
  if (p === '/reportes/rentabilidad') return [{ id: 9001, nombre: productos[0].nombre, precio: 10000, precioVenta: 10000, costoIngredientes: 1020, costoTotal: 1020, costoReceta: 1020, margenBruto: 8980, margenPorcentual: 89.8, tieneCostosDefinidos: true, utilidad: 8980, margen: 89.8 }];
  if (p === '/reportes/periodos') { const period = { actual: { total: 24000, cantidadPedidos: 1 }, anterior: { total: 20000, cantidadPedidos: 1 }, variacionPorcentual: 20 }; return { semana: period, mes: period }; }
  if (p === '/consumo-empleados') return [];
  if (p === '/consumo-empleados/resumen') return { totalRegistros: 0, costoEstimadoMes: 0 };
  throw new Error(`Ruta de demostración no definida: ${p}`);
}
async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'es-CO', serviceWorkers: 'block' });
  const intercepted = []; const errors = [];
  await context.route('**/*', async (route) => {
    const req = route.request(); const url = new URL(req.url());
    if (url.hostname === 'localhost' && url.port === '3000') {
      intercepted.push({ method: req.method(), path: url.pathname });
      if (url.pathname === '/pedidos/stream') return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': demo\n\n', headers: { 'Access-Control-Allow-Origin': '*' } });
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
      if (url.pathname === '/auth/login' && req.method() === 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'TOKEN_SINTETICO_NO_VALIDO', usuario: { ...usuario, rol: loginRole } }), headers: { 'Access-Control-Allow-Origin': '*' } });
      if (req.method() !== 'GET') return route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'Captura documental: escritura deshabilitada' }), headers: { 'Access-Control-Allow-Origin': '*' } });
      try { return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response(url)), headers: { 'Access-Control-Allow-Origin': '*' } }); }
      catch (e) { errors.push(e.message); return route.abort(); }
    }
    if (url.hostname === 'localhost' && url.port === '3001') return route.continue();
    if (['data:', 'blob:'].includes(url.protocol)) return route.continue();
    return route.abort();
  });
  await context.addInitScript(({ usuario }) => {
    localStorage.setItem('token', 'TOKEN_SINTETICO_NO_VALIDO');
    localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'TOKEN_SINTETICO_NO_VALIDO', usuario, inicioSesion: new Date().toISOString(), hydrated: true }, version: 0 }));
  }, { usuario });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  const captures = [];
  async function shot(name) {
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.evaluate(() => {
      let badge = document.getElementById('docs-demo');
      if (!badge) { badge = document.createElement('div'); badge.id = 'docs-demo'; document.body.append(badge); }
      badge.textContent = 'CAPTURA DEL SISTEMA · DATOS DE DEMOSTRACIÓN';
      badge.style.cssText = 'position:fixed;bottom:4px;left:4px;z-index:2147483647;background:#fff;color:#172033;padding:5px 10px;font:11px Arial;border:1px solid #94a3b8;border-radius:4px;pointer-events:none';
    });
    await page.screenshot({ path: path.join(out, name + '.png'), fullPage: false });
    captures.push({ archivo: name + '.png', ruta: new URL(page.url()).pathname });
  }
  async function go(route, name, text) {
    if (route === '/cocina') {
      loginRole = 'COCINERO';
      await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 90000 });
      await page.getByPlaceholder('tu@email.com').fill('cocina@example.invalid');
      await page.locator('input[type=password]').fill('DEMOSTRACION');
      await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
      await page.waitForURL('**/cocina');
      loginRole = 'ADMIN_EMPRESA';
    } else if (route === '/consumo-empleados') {
      await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle', timeout: 90000 });
      await page.getByRole('button', { name: 'Consumo staff', exact: false }).click();
      await page.waitForURL('**/consumo-empleados');
    } else await page.goto('http://localhost:3001' + route, { waitUntil: 'networkidle', timeout: 90000 });
    if (text) await page.getByText(text, { exact: false }).first().waitFor({ timeout: 15000 });
    await shot(name);
  }
  await go('/login', '01-login', 'Iniciar sesión');
  await go('/dashboard', '02-dashboard', 'Pedidos recientes');
  await page.getByText('Monto contado al cerrar', { exact: true }).scrollIntoViewIfNeeded(); await shot('03-cierre-caja');
  cajaAbierta = false; await go('/dashboard', '04-apertura-general', 'Base de caja diaria'); await page.getByText('Base de caja diaria', { exact: true }).scrollIntoViewIfNeeded(); await shot('04-apertura-caja'); cajaAbierta = true;
  await go('/pos', '05-pos', 'Confirmar pedido');
  await page.getByText('Hamburguesa clásica', { exact: true }).first().click(); await shot('06-personalizar-pedido');
  await go('/cocina', '07-cocina', 'Iniciar preparación');
  await go('/productos', '08-productos', 'Gestión de productos');
  await page.getByRole('button', { name: 'Nuevo producto', exact: true }).click(); await shot('09-producto-formulario');
  await go('/inventario', '10-inventario', 'Total ingredientes');
  await go('/clientes', '11-clientes', 'Nuevo cliente');
  await page.getByRole('button', { name: 'Nuevo cliente', exact: true }).click(); await shot('12-cliente-formulario');
  await go('/financiero', '13-financiero', 'Movimientos financieros');
  await go('/reportes', '14-reportes', 'Reportes avanzados');
  await go('/configuracion', '15-configuracion', 'Logo de la empresa');
  await page.getByRole('button', { name: 'Mi perfil', exact: false }).click(); await shot('16-perfil');
  await page.getByRole('button', { name: 'Sucursales', exact: true }).click(); await shot('17-sucursales');
  await page.getByRole('button', { name: 'Usuarios y permisos', exact: false }).click(); await shot('18-usuarios');
  await go('/consumo-empleados', '19-consumo-empleados', 'Historial reciente');
  await go('/cliente', '20-pantalla-cliente', 'Resumen de su pedido');
  await page.evaluate(() => { const channel = new BroadcastChannel('powerpos-pantalla-cliente'); channel.postMessage({ empresa: 'Restaurante Piloto DEMO', items: [{ nombre: 'Hamburguesa clásica', cantidad: 2, precio: 12000, adicionales: [{ nombre: 'Extra queso', cantidad: 1 }] }], total: 24000, pedido: null }); channel.close(); });
  await page.getByText('Hamburguesa clásica', { exact: true }).waitFor(); await shot('20-pantalla-cliente');
  await go('/llamado', '21-llamado', 'Esperando pedido');
  await page.evaluate(() => { window.dispatchEvent(new CustomEvent('powerpos-llamado-cliente-event', { detail: { empresa: 'Restaurante Piloto DEMO', estado: 'LISTO', pedido: 'DEMO-001', clienteNombre: 'Cliente DEMO' } })); });
  await page.getByText('Cliente DEMO', { exact: true }).waitFor(); await shot('21-llamado');
  fs.writeFileSync(path.join(out, 'capturas.json'), JSON.stringify({ fecha: new Date().toISOString(), origen: 'Frontend real; API interceptada con datos sintéticos; no prueba integración backend.', captures, errores: errors, peticionesInterceptadas: intercepted.length }, null, 2));
  console.log(JSON.stringify({ capturas: captures.length, errores: errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exit(1); });
