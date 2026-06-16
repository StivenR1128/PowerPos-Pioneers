'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Plus, Edit, Trash2, LogOut, LayoutDashboard, ShoppingCart, Package } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';


interface Categoria {
  id: number;
  nombre: string;
  icono: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria;
  ingredientes: { ingrediente: { id: number; nombre: string; unidad: string }; cantidad: string }[];
}

const ROLES_ADMIN = ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENTE'];

export default function ProductosPage() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    disponible: true,
  });

  useEffect(() => {
    if (!usuario || !ROLES_ADMIN.includes(usuario.rol)) {
      router.push('/login');
      return;
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [prods, cats] = await Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
    ]);
    setProductos(prods.data);
    setCategorias(cats.data);
  };

  const abrirModal = (producto?: Producto) => {
    if (producto) {
      setEditando(producto);
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        categoriaId: String(producto.categoria.id),
        disponible: producto.disponible,
      });
    } else {
      setEditando(null);
      setForm({ nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true });
    }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio || !form.categoriaId) return;
    setLoading(true);
    try {
      if (editando) {
        await api.patch(`/productos/${editando.id}`, {
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          categoriaId: Number(form.categoriaId),
          disponible: form.disponible,
        });
      } else {
        await api.post('/productos', {
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          categoriaId: Number(form.categoriaId),
          disponible: form.disponible,
        });
      }
      setModal(false);
      cargarDatos();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Deseas desactivar este producto?')) return;
    await api.delete(`/productos/${id}`);
    cargarDatos();
  };

  const toggleDisponible = async (producto: Producto) => {
    await api.patch(`/productos/${producto.id}`, { disponible: !producto.disponible });
    cargarDatos();
  };

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Power<span className="text-orange-500">POS</span></h1>
          <span className="text-gray-500 text-sm">|</span>
          <span className="text-gray-400 text-sm">{usuario?.empresa}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/pos')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ShoppingCart size={16} />POS
          </button>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <LayoutDashboard size={16} />Dashboard
          </button>
          <button className="flex items-center gap-2 text-orange-500 text-sm">
            <Package size={16} />Productos
          </button>
          <span className="text-gray-400 text-sm">{usuario?.nombre}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">Gestión de productos</h2>
            <p className="text-gray-500 text-sm mt-1">{productos.length} productos registrados</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Producto</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Categoría</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Precio</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Disponible</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Ingredientes</th>
                <th className="text-right text-gray-500 text-sm font-medium px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">{producto.nombre}</div>
                    {producto.descripcion && (
                      <div className="text-gray-500 text-xs mt-0.5">{producto.descripcion}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">
                      {producto.categoria?.icono} {producto.categoria?.nombre}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-orange-500 font-bold text-sm">
                      ${Number(producto.precio).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDisponible(producto)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        producto.disponible
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                    >
                      {producto.disponible ? '● Disponible' : '● No disponible'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">
                      {producto.ingredientes?.length || 0} ingredientes
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => abrirModal(producto)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(producto.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-white font-bold text-lg mb-4">
              {editando ? 'Editar producto' : 'Nuevo producto'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Descripción opcional"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Precio</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                <select
                  value={form.categoriaId}
                  onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={form.disponible}
                  onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="disponible" className="text-gray-400 text-sm">Disponible para venta</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold rounded-lg py-3 transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}