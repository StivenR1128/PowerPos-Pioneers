'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, CircleOff, Clock3, LogOut, Plus, RefreshCw, Save, ShieldCheck, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const MODULOS = [
  { id: 'pos', label: 'POS y caja' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'productos', label: 'Productos y recetas' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'financiero', label: 'Financiero' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'cocina', label: 'Cocina / KDS' },
  { id: 'configuracion', label: 'Configuracion' },
];

type Plan = 'BASICO' | 'MEDIUM' | 'PREMIUM';

interface Empresa {
  id: number;
  nombre: string;
  nit: string;
  email: string;
  telefono?: string;
  activo: boolean;
  plan: Plan;
  permisos: Record<string, boolean>;
  modoPreparacion: 'KDS' | 'COMANDAS';
  facturacionElectronicaHabilitada: boolean;
  _count: { usuarios: number; sucursales: number };
}

interface Resumen {
  empresas: number;
  empresasActivas: number;
  usuariosActivos: number;
}

interface RegistroAuditoria {
  id: number;
  accion: string;
  entidad: string;
  creadoEn: string;
  usuario?: { nombre: string; email: string };
  empresa?: { nombre: string };
}

const permisosPorPlan: Record<Plan, string[]> = {
  BASICO: ['pos', 'productos'],
  MEDIUM: ['pos', 'dashboard', 'productos', 'inventario', 'clientes', 'cocina', 'configuracion'],
  PREMIUM: MODULOS.map((modulo) => modulo.id),
};

export default function SuperadminPage() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [seleccionada, setSeleccionada] = useState<Empresa | null>(null);
  const [plan, setPlan] = useState<Plan>('BASICO');
  const [permisos, setPermisos] = useState<Record<string, boolean>>({});
  const [modoPreparacion, setModoPreparacion] = useState<'KDS' | 'COMANDAS'>('KDS');
  const [facturacionHabilitada, setFacturacionHabilitada] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [creando, setCreando] = useState(false);
  const [planNuevo, setPlanNuevo] = useState<Plan>('BASICO');
  const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: '', nit: '', email: '', telefono: '', direccion: '', adminNombre: '', adminEmail: '', adminPassword: '' });

  const seleccionarEmpresa = (empresa: Empresa) => {
    setSeleccionada(empresa);
    setPlan(empresa.plan);
    setPermisos(empresa.permisos || {});
    setModoPreparacion(empresa.modoPreparacion || 'KDS');
    setFacturacionHabilitada(Boolean(empresa.facturacionElectronicaHabilitada));
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      const [resumenRes, empresasRes, auditoriaRes] = await Promise.all([
        api.get('/superadmin/resumen'),
        api.get('/superadmin/empresas'),
        api.get('/superadmin/auditoria'),
      ]);
      setResumen(resumenRes.data);
      setEmpresas(empresasRes.data);
      setAuditoria(auditoriaRes.data);
      if (seleccionada) {
        const actualizada = empresasRes.data.find((empresa: Empresa) => empresa.id === seleccionada.id);
        if (actualizada) seleccionarEmpresa(actualizada);
      }
    } catch {
      setError('No fue posible cargar la administracion de empresas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!usuario) {
      router.replace('/login');
      return;
    }
    if (usuario.rol !== 'SUPERADMIN') {
      router.replace('/pos');
      return;
    }
    cargarDatos();
  }, [usuario, router]);

  const aplicarPlan = (nuevoPlan: Plan) => {
    setPlan(nuevoPlan);
    setPermisos(Object.fromEntries(MODULOS.map((modulo) => [modulo.id, permisosPorPlan[nuevoPlan].includes(modulo.id)])));
  };

  const guardarConfiguracion = async () => {
    if (!seleccionada) return;
    setGuardando(true);
    try {
      await api.patch(`/superadmin/empresas/${seleccionada.id}/configuracion`, { plan, permisos, modoPreparacion, facturacionElectronicaHabilitada: facturacionHabilitada });
      await cargarDatos();
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (empresa: Empresa) => {
    await api.patch(`/superadmin/empresas/${empresa.id}/estado`, { activo: !empresa.activo });
    await cargarDatos();
  };

  const crearEmpresa = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreando(true);
    setError('');
    try {
      await api.post('/superadmin/empresas', {
        empresa: { nombre: nuevaEmpresa.nombre, nit: nuevaEmpresa.nit, email: nuevaEmpresa.email, telefono: nuevaEmpresa.telefono, direccion: nuevaEmpresa.direccion },
        admin: { nombre: nuevaEmpresa.adminNombre, email: nuevaEmpresa.adminEmail, password: nuevaEmpresa.adminPassword },
        plan: planNuevo,
        permisos: permisosPorPlan[planNuevo].reduce((acceso, modulo) => ({ ...acceso, [modulo]: true }), {} as Record<string, boolean>),
      });
      setMostrarCrear(false);
      setNuevaEmpresa({ nombre: '', nit: '', email: '', telefono: '', direccion: '', adminNombre: '', adminEmail: '', adminPassword: '' });
      setPlanNuevo('BASICO');
      await cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'No fue posible crear la empresa.');
    } finally {
      setCreando(false);
    }
  };

  if (!usuario || usuario.rol !== 'SUPERADMIN') return null;

  return (
    <main className="min-h-screen bg-[#0b1017] text-white">
      <header className="border-b border-slate-800 bg-slate-950 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950"><Building2 size={23} /></div>
          <div><p className="text-orange-400 text-xs uppercase tracking-[0.2em] font-bold">PowerPOS Control</p><h1 className="text-2xl font-black">Administracion de empresas</h1></div>
        </div>
        <div className="flex items-center gap-5"><span className="text-slate-400 text-sm">{usuario.nombre}</span><button onClick={() => { logout(); router.replace('/login'); }} title="Cerrar sesion" className="text-slate-400 hover:text-white"><LogOut size={19} /></button></div>
      </header>

      <section className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-end justify-between"><div><p className="text-slate-400 text-sm">Planes, acceso a modulos y estado de cuentas</p><h2 className="text-3xl font-black mt-1">Control SaaS</h2></div><div className="flex gap-2"><button onClick={() => setMostrarCrear(true)} className="flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-2"><Plus size={15} /> Nueva empresa</button><button onClick={cargarDatos} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg px-3 py-2"><RefreshCw size={15} /> Actualizar</button></div></div>
        {error && <div className="border border-red-500/30 bg-red-500/10 text-red-300 rounded-xl p-4">{error}</div>}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5"><Building2 size={19} className="text-orange-400" /><p className="text-slate-400 text-xs mt-4">Empresas registradas</p><p className="text-2xl font-black mt-1">{resumen?.empresas || 0}</p></div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5"><CheckCircle2 size={19} className="text-emerald-400" /><p className="text-slate-400 text-xs mt-4">Empresas activas</p><p className="text-2xl font-black mt-1">{resumen?.empresasActivas || 0}</p></div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5"><Users size={19} className="text-blue-400" /><p className="text-slate-400 text-xs mt-4">Usuarios activos</p><p className="text-2xl font-black mt-1">{resumen?.usuariosActivos || 0}</p></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between"><h3 className="font-bold">Empresas y planes</h3><span className="text-slate-500 text-sm">{empresas.length} cuentas</span></div>
            {cargando ? <div className="p-10 text-center text-slate-500">Cargando empresas...</div> : <div className="divide-y divide-slate-800">{empresas.map((empresa) => <button key={empresa.id} onClick={() => seleccionarEmpresa(empresa)} className={`w-full text-left px-5 py-4 hover:bg-slate-800/50 ${seleccionada?.id === empresa.id ? 'bg-orange-500/10 border-l-2 border-orange-500' : ''}`}><div className="flex items-center justify-between gap-4"><div><div className="font-semibold">{empresa.nombre}</div><div className="text-slate-500 text-xs mt-1">NIT {empresa.nit} · {empresa._count.usuarios} usuarios · {empresa._count.sucursales} sucursales</div></div><div className="text-right"><span className={`text-xs font-bold ${empresa.plan === 'PREMIUM' ? 'text-violet-300' : empresa.plan === 'MEDIUM' ? 'text-blue-300' : 'text-slate-300'}`}>{empresa.plan}</span><div className={`text-xs mt-2 ${empresa.activo ? 'text-emerald-400' : 'text-red-400'}`}>{empresa.activo ? 'Activa' : 'Inactiva'}</div></div></div></button>)}</div>}
          </div>

          <aside className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit">
            {!seleccionada ? <div className="py-8 text-center text-slate-500"><ShieldCheck size={30} className="mx-auto mb-3 text-slate-600" /><p>Selecciona una empresa para administrar su plan y permisos.</p></div> : <>
              <div className="flex items-start justify-between"><div><p className="text-xs text-slate-500 uppercase tracking-wider">Configuracion</p><h3 className="text-xl font-black mt-1">{seleccionada.nombre}</h3></div><button onClick={() => cambiarEstado(seleccionada)} className="text-xs border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 hover:border-orange-500">{seleccionada.activo ? 'Desactivar' : 'Activar'}</button></div>
              <label className="block text-sm text-slate-400 mt-6 mb-2">Plan comercial</label>
              <select value={plan} onChange={(event) => aplicarPlan(event.target.value as Plan)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white"><option value="BASICO">Basico</option><option value="MEDIUM">Medium</option><option value="PREMIUM">Premium</option></select>
              <p className="text-slate-500 text-xs mt-2">El plan sirve como base; puedes ajustar los modulos permitidos.</p>
              <label className="block text-sm text-slate-400 mt-5 mb-2">Preparacion de pedidos</label>
              <select value={modoPreparacion} onChange={(event) => setModoPreparacion(event.target.value as 'KDS' | 'COMANDAS')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white">
                <option value="KDS">KDS en pantalla</option>
                <option value="COMANDAS">Comandas impresas</option>
              </select>
              <p className="text-slate-500 text-xs mt-2">KDS es el modo predeterminado para nuevas empresas.</p>
              <label className="flex items-center justify-between gap-3 bg-slate-800/60 rounded-lg px-3 py-2.5 text-sm mt-4"><span>Facturacion electronica</span><input type="checkbox" checked={facturacionHabilitada} onChange={(event) => setFacturacionHabilitada(event.target.checked)} className="h-4 w-4 accent-orange-500" /></label>
              <p className="text-slate-500 text-xs mt-2">Debe configurarse con un proveedor tecnologico. Permanece desactivada para el Trailer del Sabor.</p>
              <div className="mt-6 space-y-2">{MODULOS.map((modulo) => <label key={modulo.id} className="flex items-center justify-between gap-3 bg-slate-800/60 rounded-lg px-3 py-2.5 text-sm"><span>{modulo.label}</span><input type="checkbox" checked={Boolean(permisos[modulo.id])} onChange={(event) => setPermisos((actuales) => ({ ...actuales, [modulo.id]: event.target.checked }))} className="h-4 w-4 accent-orange-500" /></label>)}</div>
              <button onClick={guardarConfiguracion} disabled={guardando} className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-lg py-2.5 flex items-center justify-center gap-2"><Save size={16} /> {guardando ? 'Guardando...' : 'Guardar configuracion'}</button>
            </>}
          </aside>
        </div>
        <div className="text-slate-500 text-xs">El superadmin administra cuentas y acceso a modulos. Las ventas permanecen dentro del entorno privado de cada empresa.</div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2"><Clock3 size={17} className="text-slate-400" /><h3 className="font-bold">Auditoria administrativa</h3></div>
          <div className="divide-y divide-slate-800">
            {auditoria.length === 0 ? <div className="p-6 text-slate-500 text-sm">Aun no hay acciones registradas.</div> : auditoria.slice(0, 20).map((registro) => <div key={registro.id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm"><div><span className="text-orange-300 font-semibold">{registro.accion}</span><span className="text-slate-400"> en {registro.entidad}</span><div className="text-slate-500 text-xs mt-1">{registro.empresa?.nombre || 'Sistema'} · {registro.usuario?.nombre || 'Usuario'}</div></div><time className="text-slate-500 text-xs whitespace-nowrap">{new Date(registro.creadoEn).toLocaleString('es-CO')}</time></div>)}
          </div>
        </div>
      </section>

      {mostrarCrear && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><form onSubmit={crearEmpresa} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5"><div className="flex items-center justify-between"><div><p className="text-orange-400 text-xs uppercase tracking-wider">Alta de cuenta</p><h2 className="text-2xl font-black">Nueva empresa</h2></div><button type="button" onClick={() => setMostrarCrear(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{([['nombre', 'Nombre de la empresa'], ['nit', 'NIT'], ['email', 'Email de empresa'], ['telefono', 'Telefono'], ['direccion', 'Direccion'], ['adminNombre', 'Nombre del administrador'], ['adminEmail', 'Email del administrador'], ['adminPassword', 'Clave inicial']] as const).map(([campo, etiqueta]) => <label key={campo} className="text-sm text-slate-300">{etiqueta}<input required={['nombre', 'nit', 'email', 'adminNombre', 'adminEmail', 'adminPassword'].includes(campo)} type={campo === 'adminPassword' ? 'password' : campo.toLowerCase().includes('email') ? 'email' : 'text'} value={nuevaEmpresa[campo]} onChange={(event) => setNuevaEmpresa((actual) => ({ ...actual, [campo]: event.target.value }))} className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white" /></label>)}</div><label className="block text-sm text-slate-300">Plan inicial<select value={planNuevo} onChange={(event) => setPlanNuevo(event.target.value as Plan)} className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white"><option value="BASICO">Basico</option><option value="MEDIUM">Medium</option><option value="PREMIUM">Premium</option></select></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setMostrarCrear(false)} className="border border-slate-700 text-slate-300 rounded-lg px-4 py-2">Cancelar</button><button disabled={creando} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-lg px-4 py-2">{creando ? 'Creando...' : 'Crear empresa'}</button></div></form></div>}
    </main>
  );
}
