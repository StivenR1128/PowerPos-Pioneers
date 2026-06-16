'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { ShoppingCart, Plus, Minus, Trash2, LogOut, LayoutDashboard  } from 'lucide-react';

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
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
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

  useEffect(() => {
    if (!usuario) { router.push('/login'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [cats, prods] = await Promise.all([
      api.get('/categorias'),
      api.get('/productos'),
    ]);
    setCategorias(cats.data);
    setProductos(prods.data);
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
        items: carrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          exclusiones: item.exclusiones,
          observacion: item.observacion,
        })),
      });
      setPedidoExitoso(data.numero);
      setCarrito([]);
      setTimeout(() => setPedidoExitoso(null), 4000);
    } catch (e) {
      alert('Error al registrar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Power<span className="text-orange-500">POS</span></h1>
          <span className="text-gray-500 text-sm">|</span>
          <span className="text-gray-400 text-sm">{usuario?.empresa}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <span className="text-gray-400 text-sm">{usuario?.nombre}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {pedidoExitoso && (
        <div className="bg-green-500/10 border-b border-green-500/20 text-green-400 text-center py-3 text-sm font-medium">
          ✓ Pedido {pedidoExitoso} registrado exitosamente
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Panel productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Categorías */}
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

          {/* Grid productos */}
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

        {/* Carrito */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <ShoppingCart size={18} className="text-orange-500" />
            <span className="text-white font-semibold">Pedido actual</span>
            <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{carrito.length}</span>
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

      {/* Modal exclusiones */}
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
  );
}