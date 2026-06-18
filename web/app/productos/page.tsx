'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2, X, Tag } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';

interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  color?: string;
}

interface IngredienteReceta {
  ingredienteId: number | null;
  nombre: string;
  unidad: string;
  cantidad: string;
  stockInicial?: string;
  stockMinimo?: string;
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

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    disponible: true,
  });
  const [recetaTemp, setRecetaTemp] = useState<IngredienteReceta[]>([]);
  const [formCategoria, setFormCategoria] = useState({ nombre: '', icono: '🍽️', color: '#FF6B35' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [prods, cats, ings] = await Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
      api.get('/inventario'),
    ]);
    setProductos(prods.data);
    setCategorias(cats.data);
    setIngredientesDisponibles(ings.data);
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
      setRecetaTemp(
        producto.ingredientes.map((pi) => ({
          ingredienteId: pi.ingrediente.id,
          nombre: pi.ingrediente.nombre,
          unidad: pi.ingrediente.unidad,
          cantidad: String(pi.cantidad),
        }))
      );
    } else {
      setEditando(null);
      setForm({ nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true });
      setRecetaTemp([]);
    }
    setModal(true);
  };

  const agregarIngredienteReceta = () => {
    setRecetaTemp([...recetaTemp, { ingredienteId: null, nombre: '', unidad: 'gramos', cantidad: '' }]);
  };

  const quitarIngredienteReceta = (index: number) => {
    setRecetaTemp(recetaTemp.filter((_, i) => i !== index));
  };

  const actualizarIngredienteReceta = (index: number, campo: string, valor: any) => {
    const nuevo = [...recetaTemp];
    if (campo === 'ingredienteExistente') {
      const ing = ingredientesDisponibles.find((i) => i.id === Number(valor));
      if (ing) {
        nuevo[index] = { ...nuevo[index], ingredienteId: ing.id, nombre: ing.nombre, unidad: ing.unidad };
      }
    } else {
      (nuevo[index] as any)[campo] = valor;
    }
    setRecetaTemp(nuevo);
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio || !form.categoriaId) return;
    setLoading(true);
    try {
      const ingredientesPayload = recetaTemp
        .filter((r) => r.cantidad)
        .map((r) => ({
          ingredienteId: r.ingredienteId,
          nombre: r.nombre,
          unidad: r.unidad,
          cantidad: Number(r.cantidad),
          stockInicial: r.stockInicial ? Number(r.stockInicial) : 0,
          stockMinimo: r.stockMinimo ? Number(r.stockMinimo) : 0,
        }));

      const payload: any = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        categoriaId: Number(form.categoriaId),
        disponible: form.disponible,
      };
      if (ingredientesPayload.length > 0) {
        payload.ingredientes = ingredientesPayload;
      }

      if (editando) {
        await api.patch(`/productos/${editando.id}`, payload);
      } else {
        await api.post('/productos', payload);
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

  const crearCategoria = async () => {
    if (!formCategoria.nombre) return;
    setLoading(true);
    try {
      await api.post('/categorias', formCategoria);
      setModalCategoria(false);
      setFormCategoria({ nombre: '', icono: '🍽️', color: '#FF6B35' });
      cargarDatos();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">Gestión de productos</h2>
            <p className="text-gray-500 text-sm mt-1">{productos.length} productos registrados · {categorias.length} categorías</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalCategoria(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <Tag size={16} />
              Nueva categoría
            </button>
            <button
              onClick={() => abrirModal()}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={18} />
              Nuevo producto
            </button>
          </div>
        </div>

        {/* Chips de categorías */}
        {categorias.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {categorias.map((cat) => (
              <span
                key={cat.id}
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: `${cat.color}1A`,
                  borderColor: `${cat.color}40`,
                  color: cat.color,
                }}
              >
                {cat.icono} {cat.nombre}
              </span>
            ))}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Producto</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Categoría</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Precio</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Disponible</th>
                <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Receta</th>
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

      {/* Modal producto */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-800 max-h-[90vh] overflow-y-auto">
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

              <div className="grid grid-cols-2 gap-3">
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
                    <option value="">Selecciona</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icono} {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
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

              {/* Receta / ingredientes */}
              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-400">Receta (ingredientes)</label>
                  <button
                    onClick={agregarIngredienteReceta}
                    className="text-orange-500 text-xs font-medium hover:text-orange-400 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Agregar ingrediente
                  </button>
                </div>

                {recetaTemp.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-3">Sin ingredientes — útil para bebidas o productos sin receta</p>
                ) : (
                  <div className="space-y-2">
                    {recetaTemp.map((ing, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={ing.ingredienteId || ''}
                            onChange={(e) => actualizarIngredienteReceta(index, 'ingredienteExistente', e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                          >
                            <option value="">— Elegir ingrediente existente —</option>
                            {ingredientesDisponibles.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.nombre} ({opt.unidad})</option>
                            ))}
                          </select>
                          <button onClick={() => quitarIngredienteReceta(index)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <X size={16} />
                          </button>
                        </div>

                        {!ing.ingredienteId && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={ing.nombre}
                              onChange={(e) => actualizarIngredienteReceta(index, 'nombre', e.target.value)}
                              placeholder="O escribe uno nuevo"
                              className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                            />
                            <select
                              value={ing.unidad}
                              onChange={(e) => actualizarIngredienteReceta(index, 'unidad', e.target.value)}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                            >
                              <option value="gramos">Gramos</option>
                              <option value="unidad">Unidad</option>
                              <option value="mililitros">Mililitros</option>
                              <option value="lonchas">Lonchas</option>
                              <option value="porciones">Porciones</option>
                              <option value="litros">Litros</option>
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-500 text-xs">Cantidad por unidad vendida</label>
                            <input
                              type="number"
                              value={ing.cantidad}
                              onChange={(e) => actualizarIngredienteReceta(index, 'cantidad', e.target.value)}
                              placeholder={`Ej: 150 ${ing.unidad}`}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          {!ing.ingredienteId && (
                            <div>
                              <label className="text-gray-500 text-xs">Stock inicial</label>
                              <input
                                type="number"
                                value={ing.stockInicial || ''}
                                onChange={(e) => actualizarIngredienteReceta(index, 'stockInicial', e.target.value)}
                                placeholder="0"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Modal categoría */}
      {modalCategoria && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <h3 className="text-white font-bold text-lg mb-4">Nueva categoría</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Ej: Hamburguesas, Bebidas, Postres..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ícono (emoji)</label>
                  <input
                    type="text"
                    value={formCategoria.icono}
                    onChange={(e) => setFormCategoria({ ...formCategoria, icono: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="🍔"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={formCategoria.color}
                    onChange={(e) => setFormCategoria({ ...formCategoria, color: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg h-[38px] cursor-pointer"
                  />
                </div>
              </div>
              <div className="rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: `${formCategoria.color}1A` }}>
                <span style={{ color: formCategoria.color }} className="text-sm font-medium">
                  Vista previa: {formCategoria.icono} {formCategoria.nombre || 'Nombre categoría'}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalCategoria(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 transition-colors">
                Cancelar
              </button>
              <button onClick={crearCategoria} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold rounded-lg py-3 transition-colors">
                {loading ? 'Creando...' : 'Crear categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}