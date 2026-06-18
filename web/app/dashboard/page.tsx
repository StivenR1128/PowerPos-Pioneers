'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Pedido {
  id: number;
  numero: string;
  estado: string;
  total: string;
  metodoPago: string;
  creadoEn: string;
  usuario: { nombre: string };
  detalles: { cantidad: number; producto: { nombre: string } }[];
}

const COLORES = ['#FF6B35', '#f7931e', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#facc15'];

export default function DashboardPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [cajaAbierta, setCajaAbierta] = useState<any>(null);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [resumenFinanciero, setResumenFinanciero] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, alertasRes, cajaRes, statsRes, financieroRes] = await Promise.all([
        api.get('/pedidos'),
        api.get('/caja/alertas'),
        api.get('/caja/abierta'),
        api.get('/pedidos/estadisticas'),
        api.get('/financiero/resumen'),
      ]);
      setPedidos(pedidosRes.data);
      setAlertas(alertasRes.data);
      setCajaAbierta(cajaRes.data);
      setEstadisticas(statsRes.data);
      setResumenFinanciero(financieroRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const hoy = new Date().toDateString();
  const pedidosHoy = pedidos.filter(p => new Date(p.creadoEn).toDateString() === hoy);
  const totalHoy = pedidosHoy.reduce((acc, p) => acc + Number(p.total), 0);
  const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
  const enCocina = pedidos.filter(p => p.estado === 'EN_COCINA').length;

  const estadoColor: Record<string, string> = {
    PENDIENTE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    EN_COCINA: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    LISTO: 'bg-green-500/10 text-green-400 border-green-500/20',
    ENTREGADO: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    ANULADO: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const estadoLabel: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_COCINA: 'En cocina',
    LISTO: 'Listo',
    ENTREGADO: 'Entregado',
    ANULADO: 'Anulado',
  };

  const actualizarEstado = async (id: number, estado: string) => {
    await api.patch(`/pedidos/${id}/estado`, { estado });
    cargarDatos();
  };

  const datosIngresosEgresos = resumenFinanciero ? [
    { nombre: 'Ingresos', valor: resumenFinanciero.totalIngresos || 0 },
    { nombre: 'Egresos', valor: resumenFinanciero.totalEgresos || 0 },
  ] : [];

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500/10 p-2 rounded-lg">
                <DollarSign size={18} className="text-orange-500" />
              </div>
              <span className="text-gray-400 text-sm">Ventas hoy</span>
            </div>
            <div className="text-2xl font-bold text-white">${totalHoy.toLocaleString()}</div>
            <div className="text-gray-500 text-xs mt-1">{pedidosHoy.length} pedidos</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <ShoppingBag size={18} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Total pedidos</span>
            </div>
            <div className="text-2xl font-bold text-white">{pedidos.length}</div>
            <div className="text-gray-500 text-xs mt-1">Todos los tiempos</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <Clock size={18} className="text-yellow-400" />
              </div>
              <span className="text-gray-400 text-sm">Pendientes</span>
            </div>
            <div className="text-2xl font-bold text-white">{pendientes}</div>
            <div className="text-gray-500 text-xs mt-1">Por atender</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <TrendingUp size={18} className="text-green-400" />
              </div>
              <span className="text-gray-400 text-sm">En cocina</span>
            </div>
            <div className="text-2xl font-bold text-white">{enCocina}</div>
            <div className="text-gray-500 text-xs mt-1">Preparándose</div>
          </div>
        </div>

        {/* Gráficos */}
        {estadisticas && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ventas por día */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">📈</span> Ventas últimos 7 días
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={estadisticas.ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="dia" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Ventas']}
                  />
                  <Line type="monotone" dataKey="total" stroke="#FF6B35" strokeWidth={3} dot={{ fill: '#FF6B35', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Productos más vendidos */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">🏆</span> Productos más vendidos
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={estadisticas.productosMasVendidos} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={12} />
                  <YAxis dataKey="nombre" type="category" stroke="#71717a" fontSize={12} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="cantidad" fill="#f7931e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ventas por método de pago */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">💳</span> Ventas por método de pago
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estadisticas.ventasPorMetodoPago}
                    dataKey="total"
                    nameKey="metodo"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ metodo, percent }: any) => `${metodo} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {estadisticas.ventasPorMetodoPago.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                    formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Ventas por categoría */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">🍽️</span> Ventas por categoría
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estadisticas.ventasPorCategoria}
                    dataKey="total"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    label={({ categoria, percent }: any) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {estadisticas.ventasPorCategoria.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                    formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Ingresos vs Egresos */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:col-span-2">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">💰</span> Ingresos vs Egresos
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={datosIngresosEgresos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="nombre" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                    formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {datosIngresosEgresos.map((entry, index) => (
                      <Cell key={index} fill={entry.nombre === 'Ingresos' ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Estado de caja */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🏧</span> Estado de caja
            </h3>
            {cajaAbierta ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estado</span>
                  <span className="text-green-400 font-medium">● Abierta</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cajero</span>
                  <span className="text-white">{cajaAbierta.usuario?.nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monto inicial</span>
                  <span className="text-white">${Number(cajaAbierta.montoInicial).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ventas del turno</span>
                  <span className="text-orange-500 font-bold">${cajaAbierta.totalVentas?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-800 pt-2">
                  <span className="text-gray-400">Total esperado</span>
                  <span className="text-white font-bold">${cajaAbierta.totalEsperado?.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-400 font-medium">● Caja cerrada</p>
                <p className="text-gray-500 text-sm mt-1">No hay caja abierta en este momento</p>
              </div>
            )}
          </div>

          {/* Alertas */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🚨</span> Alertas
              {alertas.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alertas.length}
                </span>
              )}
            </h3>
            {alertas.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No hay alertas</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alertas.map((alerta) => (
                  <div key={alerta.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-xs font-medium">{alerta.tipo}</p>
                    <p className="text-gray-300 text-xs mt-1">{alerta.descripcion}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {alerta.usuario?.nombre} · {new Date(alerta.creadoEn).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-semibold">Pedidos recientes</h2>
            <button onClick={cargarDatos} className="text-gray-500 hover:text-white text-sm transition-colors">
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : pedidos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay pedidos aún</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {pedidos.slice(0, 20).map((pedido) => (
                <div key={pedido.id} className="p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-medium text-sm">{pedido.numero}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoColor[pedido.estado]}`}>
                        {estadoLabel[pedido.estado]}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs mb-2">
                      {pedido.detalles.map(d => `${d.cantidad}x ${d.producto.nombre}`).join(', ')}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{pedido.usuario?.nombre}</span>
                      <span>·</span>
                      <span>{pedido.metodoPago}</span>
                      <span>·</span>
                      <span>{new Date(pedido.creadoEn).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-500 font-bold text-sm mb-2">
                      ${Number(pedido.total).toLocaleString()}
                    </div>
                    <select
                      value={pedido.estado}
                      onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 px-2 py-1 focus:outline-none focus:border-orange-500"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_COCINA">En cocina</option>
                      <option value="LISTO">Listo</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="ANULADO">Anulado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}