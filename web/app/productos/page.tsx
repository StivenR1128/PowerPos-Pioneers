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

interface Adicional {
  id: number;
  nombre: string;
  precio: string;
  ingredienteId: number | null;
  cantidad: string | null;
  disponible: boolean;
  ingrediente?: { id: number; nombre: string; unidad: string } | null;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  disponible: boolean;
  aceptaAdicionales: boolean;
  activo: boolean;
  categoria: Categoria;
  ingredientes: { ingrediente: { id: number; nombre: string; unidad: string }; cantidad: string }[];
  adicionales: { adicional: { id: number; nombre: string; precio: string } }[];
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<any[]>([]);
  const [adicionalesCatalogo, setAdicionalesCatalogo] = useState<Adicional[]>([]);
  const [modal, setModal] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalAdicionales, setModalAdicionales] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    disponible: true,
    aceptaAdicionales: true,
  });
  const [recetaTemp, setRecetaTemp] = useState<IngredienteReceta[]>([]);
  const [adicionalIdsTemp, setAdicionalIdsTemp] = useState<number[]>([]);
  const [formCategoria, setFormCategoria] = useState({ nombre: '', icono: '🍽️', color: '#FF6B35' });
  const [formAdicional, setFormAdicional] = useState<{ id: number | null; nombre: string; precio: string; ingredienteId: string; cantidad: string }>({
    id: null,
    nombre: '',
    precio: '',
    ingredienteId: '',
    cantidad: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [prods, cats, ings, adic] = await Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
      api.get('/inventario'),
      api.get('/adicionales'),
    ]);
    setProductos(prods.data);
    setCategorias(cats.data);
    setIngredientesDisponibles(ings.data);
    setAdicionalesCatalogo(adic.data);
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
        aceptaAdicionales: producto.aceptaAdicionales ?? true,
      });
      setRecetaTemp(
        producto.ingredientes.map((pi) => ({
          ingredienteId: pi.ingrediente.id,
          nombre: pi.ingrediente.nombre,
          unidad: pi.ingrediente.unidad,
          cantidad: String(pi.cantidad),
        }))
      );
      setAdicionalIdsTemp((producto.adicionales || []).map((pa) => pa.adicional.id));
    } else {
      setEditando(null);
      setForm({ nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true, aceptaAdicionales: true });
      setRecetaTemp([]);
      setAdicionalIdsTemp([]);
    }
    setModal(true);
  };

  const toggleAdicionalProducto = (id: number) => {
    setAdicionalIdsTemp((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const guardarAdicional = async () => {
    if (!formAdicional.nombre || !formAdicional.precio) return;
    setLoading(true);
    try {
      const payload = {
        nombre: formAdicional.nombre,
        precio: Number(formAdicional.precio),
        ingredienteId: formAdicional.ingredienteId ? Number(formAdicional.ingredienteId) : null,
        cantidad: formAdicional.cantidad ? Number(formAdicional.cantidad) : null,
      };
      if (formAdicional.id) {
        await api.patch(`/adicionales/${formAdicional.id}`, payload);
      } else {
        await api.post('/adicionales', payload);
      }
      setFormAdicional({ id: null, nombre: '', precio: '', ingredienteId: '', cantidad: '' });
      cargarDatos();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const editarAdicional = (adicional: Adicional) => {
    setFormAdicional({
      id: adicional.id,
      nombre: adicional.nombre,
      precio: String(adicional.precio),
      ingredienteId: adicional.ingredienteId ? String(adicional.ingredienteId) : '',
      cantidad: adicional.cantidad ? String(adicional.cantidad) : '',
    });
  };

  const eliminarAdicional = async (id: number) => {
    if (!confirm('¿Desactivar este adicional?')) return;
    await api.delete(`/adicionales/${id}`);
    setAdicionalIdsTemp((prev) => prev.filter((x) => x !== id));
    cargarDatos();
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
        aceptaAdicionales: form.aceptaAdicionales,
        adicionalIds: adicionalIdsTemp,
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
              onClick={() => { setFormAdicional({ id: null, nombre: '', precio: '', ingredienteId: '', cantidad: '' }); setModalAdicionales(true); }}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={16} />
              Adicionales
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="aceptaAdicionales"
                  checked={form.aceptaAdicionales}
                  onChange={(e) => setForm({ ...form, aceptaAdicionales: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="aceptaAdicionales" className="text-gray-400 text-sm">
                  Acepta adicionales en el POS <span className="text-gray-600">(desmárcalo en bebidas)</span>
                </label>
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

              {/* Adicionales disponibles para este producto */}
              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-400">Adicionales disponibles en el POS</label>
                  <button
                    type="button"
                    onClick={() => { setFormAdicional({ id: null, nombre: '', precio: '', ingredienteId: '', cantidad: '' }); setModalAdicionales(true); }}
                    className="text-orange-500 text-xs font-medium hover:text-orange-400 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Gestionar catálogo
                  </button>
                </div>

                <p className="text-gray-600 text-xs mb-2">
                  Si no marcas ninguno y el producto &quot;Acepta adicionales&quot;, en el POS se ofrecen todos los
                  adicionales de la empresa. Si marcas algunos, solo se ofrecen esos.
                </p>

                {adicionalesCatalogo.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-3">
                    Aún no hay adicionales. Crea el catálogo con &quot;Gestionar catálogo&quot;.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {adicionalesCatalogo.map((ad) => (
                      <button
                        type="button"
                        key={ad.id}
                        onClick={() => toggleAdicionalProducto(ad.id)}
                        className={`px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                          adicionalIdsTemp.includes(ad.id)
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {adicionalIdsTemp.includes(ad.id) ? '✓ ' : ''}
                        {ad.nombre}
                        <span className="text-gray-500"> · ${Number(ad.precio).toLocaleString()}</span>
                      </button>
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

      {/* Modal catálogo de adicionales */}
      {modalAdicionales && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Catálogo de adicionales</h3>
              <button onClick={() => setModalAdicionales(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Formulario alta / edición */}
            <div className="bg-gray-800 rounded-lg p-3 space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 text-xs">Nombre</label>
                  <input
                    type="text"
                    value={formAdicional.nombre}
                    onChange={(e) => setFormAdicional({ ...formAdicional, nombre: e.target.value })}
                    placeholder="Ej: Extra queso"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Precio</label>
                  <input
                    type="number"
                    value={formAdicional.precio}
                    onChange={(e) => setFormAdicional({ ...formAdicional, precio: e.target.value })}
                    placeholder="0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 text-xs">Ingrediente (opcional)</label>
                  <select
                    value={formAdicional.ingredienteId}
                    onChange={(e) => setFormAdicional({ ...formAdicional, ingredienteId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                  >
                    <option value="">— Sin descuento de inventario —</option>
                    {ingredientesDisponibles.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.nombre} ({opt.unidad})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Cantidad a descontar</label>
                  <input
                    type="number"
                    value={formAdicional.cantidad}
                    disabled={!formAdicional.ingredienteId}
                    onChange={(e) => setFormAdicional({ ...formAdicional, cantidad: e.target.value })}
                    placeholder="Ej: 20"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500 disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {formAdicional.id && (
                  <button
                    onClick={() => setFormAdicional({ id: null, nombre: '', precio: '', ingredienteId: '', cantidad: '' })}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-xs transition-colors"
                  >
                    Cancelar edición
                  </button>
                )}
                <button
                  onClick={guardarAdicional}
                  disabled={loading || !formAdicional.nombre || !formAdicional.precio}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/40 text-white font-bold rounded-lg py-2 text-xs transition-colors"
                >
                  {formAdicional.id ? 'Guardar cambios' : 'Agregar adicional'}
                </button>
              </div>
            </div>

            {/* Lista */}
            {adicionalesCatalogo.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-4">Todavía no hay adicionales en el catálogo</p>
            ) : (
              <div className="space-y-2">
                {adicionalesCatalogo.map((ad) => (
                  <div key={ad.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">
                        {ad.nombre} <span className="text-orange-500">${Number(ad.precio).toLocaleString()}</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {ad.ingrediente
                          ? `Descuenta ${ad.cantidad ?? 0} ${ad.ingrediente.unidad} de ${ad.ingrediente.nombre}`
                          : 'Sin descuento de inventario'}
                      </div>
                    </div>
                    <button onClick={() => editarAdicional(ad)} className="text-gray-500 hover:text-white transition-colors">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => eliminarAdicional(ad.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}