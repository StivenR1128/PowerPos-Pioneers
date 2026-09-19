const screens = {
  pos: ['Del producto a la venta, en una sola pantalla.', 'Consulta el catálogo, personaliza productos y organiza el pedido antes de confirmar la venta.', 'Punto de venta PowerPOS con catálogo y pedido de demostración'],
  cocina: ['Cada pedido tiene su lugar en la cocina.', 'Para restaurantes y bares con preparación: consulta los pedidos pendientes y actualiza su estado en cocina.', 'Pantalla real de cocina PowerPOS con pedidos de demostración'],
  reportes: ['Mira tu operación con más claridad.', 'Consulta información de ventas y reportes para acompañar tus decisiones.', 'Pantalla real de reportes PowerPOS con datos de demostración']
};
const tabs = [...document.querySelectorAll('[data-tab]')];
function selectScreen(key, focus = false) {
  if (!screens[key]) return;
  tabs.forEach(tab => { const selected = tab.dataset.tab === key; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; if (selected && focus) tab.focus(); });
  document.getElementById('product-panel').setAttribute('aria-labelledby', `tab-${key}`);
  document.getElementById('screen-title').textContent = screens[key][0];
  document.getElementById('screen-description').textContent = screens[key][1];
  const img = document.getElementById('product-image'); img.src = `assets/${key}.png`; img.alt = screens[key][2];
}
tabs.forEach((tab, i) => { tab.addEventListener('click', () => selectScreen(tab.dataset.tab)); tab.addEventListener('keydown', e => { let next; if (e.key === 'ArrowRight') next = (i + 1) % tabs.length; if (e.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length; if (e.key === 'Home') next = 0; if (e.key === 'End') next = tabs.length - 1; if (next !== undefined) { e.preventDefault(); selectScreen(tabs[next].dataset.tab, true); } }); });
document.querySelectorAll('[data-select]').forEach(link => link.addEventListener('click', () => selectScreen(link.dataset.select)));
const message = 'Hola, quiero conocer PowerPOS y agendar una demostración para mi negocio.';
document.querySelectorAll('.demo').forEach(link => { link.href = `https://wa.me/573026931489?text=${encodeURIComponent(message)}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; });
document.getElementById('year').textContent = new Date().getFullYear();
