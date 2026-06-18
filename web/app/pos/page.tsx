'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { ShoppingCart, Plus, Minus, Trash2, User, X, Search } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  descripcion: string;
  categoria: { nombre: string; color: string; icono: string };
  ingredientes: { ingrediente: { nombre: string } }[];
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  exclusiones: string[];
  observacion: string;
}

export default function POSPage() {
  const { usuario } = useAuthStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [modalProducto, setModalProducto] = useState<Producto | null>(null);
  const [exclusionesTemp, setExclusionesTemp] = useState<string[]>([]);
  const [observacionTemp, setObservacionTemp] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState<string | null>(null);
  const [logoEmpresa, setLogoEmpresa] = useState<string | null>(null);
  const [nombreEmpresa, setNombreEmpresa] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>('');

  // Cliente asociado al pedido
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [resultadosCliente, setResultadosCliente] = useState<any[]>([]);
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    cargarDatos();
  }, [mounted]);

  useEffect(() => {
    if (!busquedaCliente) {
      setResultadosCliente([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get(`/clientes?busqueda=${busquedaCliente}`);
        setResultadosCliente(data);
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [busquedaCliente]);

  const cargarDatos = async () => {
    const [cats, prods, empresa] = await Promise.all([
      api.get('/categorias'),
      api.get('/productos'),
      api.get('/empresa'),
    ]);
    setCategorias(cats.data);
    setProductos(prods.data);
    setNombreEmpresa(empresa.data.nombre);

    if (empresa.data.logo) {
      setLogoEmpresa(empresa.data.logo);
      // Cargar logo en background sin bloquear
      fetch(empresa.data.logo)
        .then(r => r.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }))
        .then(base64 => {
          console.log('Logo listo, longitud:', base64.length);
          setLogoBase64(base64);
        })
        .catch(e => console.error('Error logo:', e));
    }
  };

  const seleccionarCliente = (cliente: any) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente('');
    setResultadosCliente([]);
    setMostrarDropdownCliente(false);
  };

  const quitarCliente = () => {
    setClienteSeleccionado(null);
  };

  const imprimirTicket = (pedido: any) => {
    const ventana = window.open('', '_blank', 'width=320,height=700');
    if (!ventana) return;

    const logoHtml = logoBase64
      ? `<img src="${logoBase64}" style="width:70px;height:70px;border-radius:16px;object-fit:cover;margin:0 auto 8px;display:block;" />`
      : `<div class="logo-placeholder">🍔</div>`;

    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket ${pedido.numero}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Courier New', monospace;
            font-size: 12px;
            width: 300px;
            margin: 0 auto;
            padding: 16px 12px;
            background: white;
            color: #111;
          }
          .header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 2px dashed #ddd;
            margin-bottom: 12px;
          }
          .logo-placeholder {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #FF6B35, #f7931e);
            border-radius: 16px;
            margin: 0 auto 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          }
          .empresa-nombre {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #111;
          }
          .empresa-subtitulo {
            font-size: 10px;
            color: #888;
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .numero-pedido {
            background: #111;
            color: white;
            border-radius: 8px;
            padding: 8px 12px;
            margin: 12px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .numero-pedido .label {
            font-size: 10px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .numero-pedido .valor {
            font-size: 14px;
            font-weight: 700;
            color: #FF6B35;
          }
          .fecha {
            text-align: center;
            font-size: 10px;
            color: #888;
            margin-bottom: 12px;
          }
          .seccion-titulo {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 8px;
          }
          .producto {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #f0f0f0;
          }
          .producto:last-child { border-bottom: none; }
          .producto-fila {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .producto-nombre {
            font-weight: 700;
            font-size: 13px;
            flex: 1;
          }
          .producto-cantidad {
            background: #FF6B35;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            margin-right: 6px;
            flex-shrink: 0;
          }
          .producto-precio {
            font-weight: 700;
            color: #111;
            white-space: nowrap;
          }
          .exclusion {
            display: inline-block;
            background: #fff0f0;
            border: 1px solid #ffcccc;
            color: #cc0000;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            margin: 4px 2px 0 26px;
          }
          .observacion-item {
            display: block;
            color: #f7931e;
            font-size: 10px;
            margin: 3px 0 0 26px;
          }
          .separador {
            border: none;
            border-top: 2px dashed #ddd;
            margin: 12px 0;
          }
          .totales {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .total-fila {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 12px;
            color: #555;
          }
          .total-final {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            color: #111;
            padding-top: 8px;
            margin-top: 4px;
            border-top: 1px solid #ddd;
          }
          .total-final span:last-child { color: #FF6B35; }
          .metodo-pago {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            background: #f0fff4;
            border: 1px solid #b2f5c8;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 600;
            color: #276749;
          }
          .observacion-pedido {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 8px 12px;
            margin-top: 10px;
            font-size: 11px;
            color: #92400e;
          }
          .footer {
            text-align: center;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 2px dashed #ddd;
          }
          .footer-gracias {
            font-size: 14px;
            font-weight: 700;
            color: #111;
            margin-bottom: 4px;
          }
          .footer-sub { font-size: 10px; color: #aaa; }
          .powered {
            margin-top: 8px;
            font-size: 9px;
            color: #ccc;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          @media print {
            body { width: 80mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoHtml}
          <div class="empresa-nombre">${nombreEmpresa.toUpperCase()}</div>
          <div class="empresa-subtitulo">Sistema de gestión gastronómica</div>
        </div>

        <div class="numero-pedido">
          <div>
            <div class="label">Pedido</div>
            <div class="valor">${pedido.numero}</div>
          </div>
          <div style="text-align:right">
            <div class="label">Estado</div>
            <div style="color:white;font-weight:700;font-size:12px">PENDIENTE</div>
          </div>
        </div>

        <div class="fecha">${new Date().toLocaleString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>

        <div class="seccion-titulo">Productos del pedido</div>

        ${pedido.detalles.map((d: any) => `
          <div class="producto">
            <div class="producto-fila">
              <span class="producto-cantidad">${d.cantidad}</span>
              <span class="producto-nombre">${d.producto.nombre}</span>
              <span class="producto-precio">$${(Number(d.precioUnitario) * d.cantidad).toLocaleString()}</span>
            </div>
            ${d.exclusiones && d.exclusiones.length > 0 ? d.exclusiones.map((exc: string) => `
              <span class="exclusion">✕ SIN ${exc.toUpperCase()}</span>
            `).join('') : ''}
            ${d.observacion ? `<span class="observacion-item">📝 ${d.observacion}</span>` : ''}
          </div>
        `).join('')}

        <hr class="separador">

        <div class="totales">
          <div class="total-fila">
            <span>Subtotal</span>
            <span>$${Number(pedido.subtotal).toLocaleString()}</span>
          </div>
          ${Number(pedido.descuento) > 0 ? `
          <div class="total-fila">
            <span>Descuento</span>
            <span style="color:#cc0000">-$${Number(pedido.descuento).toLocaleString()}</span>
          </div>` : ''}
          <div class="total-final">
            <span>TOTAL</span>
            <span>$${Number(pedido.total).toLocaleString()}</span>
          </div>
        </div>

        <div class="metodo-pago">✓ Pago en ${pedido.metodoPago}</div>

        ${pedido.cliente ? `
          <div class="observacion-pedido">
            👤 <strong>Cliente:</strong> ${pedido.cliente.nombre}
          </div>
        ` : ''}

        ${pedido.observacion ? `
          <div class="observacion-pedido">
            📝 <strong>Nota:</strong> ${pedido.observacion}
          </div>
        ` : ''}

        <div class="footer">
          <div class="footer-gracias">¡Gracias por su compra!</div>
          <div class="footer-sub">Esperamos verle pronto</div>
          <div class="powered">Powered by PowerPOS Pioneers</div>
        </div>
      </body>
      </html>
    `;

    ventana.document.write(contenido);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 800);
  };

  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoria?.nombre === categorias.find(c => c.id === categoriaActiva)?.nombre)
    : productos;

  const abrirModal = (producto: Producto) => {
    setModalProducto(producto);
    setExclusionesTemp([]);
    setObservacionTemp('');
  };

  const toggleExclusion = (nombre: string) => {
    setExclusionesTemp((prev) =>
      prev.includes(nombre) ? prev.filter((e) => e !== nombre) : [...prev, nombre]
    );
  };

  const agregarAlCarrito = () => {
    if (!modalProducto) return;
    setCarrito((prev) => {
      const existe = prev.findIndex((i) => i.producto.id === modalProducto.id && JSON.stringify(i.exclusiones) === JSON.stringify(exclusionesTemp));
      if (existe >= 0) {
        const nuevo = [...prev];
        nuevo[existe].cantidad += 1;
        return nuevo;
      }
      return [...prev, { producto: modalProducto, cantidad: 1, exclusiones: exclusionesTemp, observacion: observacionTemp }];
    });
    setModalProducto(null);
  };

  const cambiarCantidad = (index: number, delta: number) => {
    setCarrito((prev) => {
      const nuevo = [...prev];
      nuevo[index].cantidad += delta;
      if (nuevo[index].cantidad <= 0) nuevo.splice(index, 1);
      return nuevo;
    });
  };

  const total = carrito.reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0);

  const confirmarPedido = async () => {
    if (carrito.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.post('/pedidos', {
        sucursalId: 1,
        metodoPago,
        clienteId: clienteSeleccionado?.id || null,
        items: carrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          exclusiones: item.exclusiones,
          observacion: item.observacion,
        })),
      });
      setPedidoExitoso(data.numero);
      setCarrito([]);
      setClienteSeleccionado(null);
      imprimirTicket(data);
      setTimeout(() => setPedidoExitoso(null), 4000);
    } catch (e) {
      alert('Error al registrar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />

        {pedidoExitoso && (
          <div className="bg-green-500/10 border-b border-green-500/20 text-green-400 text-center py-3 text-sm font-medium">
            ✓ Pedido {pedidoExitoso} registrado exitosamente
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-800">
              <button
                onClick={() => setCategoriaActiva(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!categoriaActiva ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categoriaActiva === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {cat.icono} {cat.nombre}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
              {productosFiltrados.map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => abrirModal(producto)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-orange-500/50 hover:bg-gray-800 transition-all"
                >
                  <div className="text-2xl mb-2">{producto.categoria?.icono || '🍽️'}</div>
                  <div className="text-white font-medium text-sm mb-1">{producto.nombre}</div>
                  <div className="text-orange-500 font-bold">${Number(producto.precio).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center gap-2">
              <ShoppingCart size={18} className="text-orange-500" />
              <span className="text-white font-semibold">Pedido actual</span>
              <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{carrito.length}</span>
            </div>

            {/* Selector de cliente */}
            <div className="p-4 border-b border-gray-800">
              {clienteSeleccionado ? (
                <div className="flex items-center justify-between bg-gray-800 border border-orange-500/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-orange-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{clienteSeleccionado.nombre}</div>
                      <div className="text-yellow-400 text-xs">⭐ {clienteSeleccionado.puntos} puntos</div>
                    </div>
                  </div>
                  <button onClick={quitarCliente} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => { setBusquedaCliente(e.target.value); setMostrarDropdownCliente(true); }}
                    onFocus={() => setMostrarDropdownCliente(true)}
                    placeholder="Buscar cliente (opcional)..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                  {mostrarDropdownCliente && resultadosCliente.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                      {resultadosCliente.map((cliente) => (
                        <button
                          key={cliente.id}
                          onClick={() => seleccionarCliente(cliente)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                        >
                          <div className="text-white text-sm">{cliente.nombre}</div>
                          <div className="text-gray-500 text-xs">{cliente.telefono || cliente.documento || ''}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {carrito.length === 0 && (
                <p className="text-gray-600 text-sm text-center mt-8">Selecciona productos para agregar al pedido</p>
              )}
              {carrito.map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{item.producto.nombre}</div>
                      {item.exclusiones.length > 0 && (
                        <div className="text-red-400 text-xs mt-1">Sin: {item.exclusiones.join(', ')}</div>
                      )}
                      <div className="text-orange-500 text-sm font-bold mt-1">
                        ${(Number(item.producto.precio) * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                    <button onClick={() => cambiarCantidad(index, -item.cantidad)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => cambiarCantidad(index, -1)} className="bg-gray-700 hover:bg-gray-600 text-white rounded w-6 h-6 flex items-center justify-center transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-white text-sm font-medium">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(index, 1)} className="bg-gray-700 hover:bg-gray-600 text-white rounded w-6 h-6 flex items-center justify-center transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800 space-y-3">
              {clienteSeleccionado && total > 0 && (
                <div className="text-center text-xs text-yellow-400">
                  Este pedido sumará +{Math.floor(total / 1000)} puntos a {clienteSeleccionado.nombre.split(' ')[0]}
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">${total.toLocaleString()}</span>
              </div>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
              <button
                onClick={confirmarPedido}
                disabled={carrito.length === 0 || loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/30 text-white font-bold rounded-lg py-3 transition-colors"
              >
                {loading ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        </div>

        {modalProducto && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
              <h3 className="text-white font-bold text-lg mb-1">{modalProducto.nombre}</h3>
              <p className="text-orange-500 font-bold mb-4">${Number(modalProducto.precio).toLocaleString()}</p>

              {modalProducto.ingredientes?.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">¿Qué NO desea el cliente?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modalProducto.ingredientes.map((ing) => (
                      <button
                        key={ing.ingrediente.nombre}
                        onClick={() => toggleExclusion(ing.ingrediente.nombre)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          exclusionesTemp.includes(ing.ingrediente.nombre)
                            ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {exclusionesTemp.includes(ing.ingrediente.nombre) ? '✕ ' : ''}
                        {ing.ingrediente.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Observación</p>
                <input
                  type="text"
                  value={observacionTemp}
                  onChange={(e) => setObservacionTemp(e.target.value)}
                  placeholder="Ej: término del punto, extra salsa..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalProducto(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarAlCarrito}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg py-3 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}