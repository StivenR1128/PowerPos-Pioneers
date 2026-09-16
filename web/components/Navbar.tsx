'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, LayoutDashboard, Package, Boxes, Users, DollarSign, BarChart3, Settings, LogOut, UtensilsCrossed } from 'lucide-react';

const ITEMS = [
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/inventario', label: 'Inventario', icon: Boxes },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/financiero', label: 'Financiero', icon: DollarSign },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/configuracion', label: 'Config', icon: Settings },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAuthStore();
  const esAdminOGerente = usuario?.rol === 'ADMIN_EMPRESA' || usuario?.rol === 'GERENTE';
  const itemsVisibles = ITEMS.filter((item) => {
    if (usuario?.rol === 'CAJERO') return item.href === '/pos';
    if (esAdminOGerente) return true;
    return usuario?.permisos?.[item.href.replace('/', '')] !== false;
  });
  if (esAdminOGerente && usuario?.consumoEmpleadosHabilitado) {
    itemsVisibles.push({ href: '/consumo-empleados', label: 'Consumo staff', icon: UtensilsCrossed });
  }

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-3 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
          <h1 className="text-lg md:text-xl font-bold text-white whitespace-nowrap">Power<span className="text-orange-500">POS</span></h1>
          <span className="text-gray-500 text-sm hidden sm:inline">|</span>
          <span className="text-gray-400 text-xs md:text-sm max-w-[180px] md:max-w-[220px] truncate block min-w-0">
            {usuario?.empresa || 'Empresa'}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 justify-end overflow-x-auto scrollbar-hide">
          {itemsVisibles.map((item) => {
            const activo = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-1.5 md:gap-2 text-[11px] md:text-sm transition-colors whitespace-nowrap ${
                  activo ? 'text-orange-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={15} className="md:w-[16px] md:h-[16px]" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}

          <span className="text-gray-500 text-sm hidden md:inline">|</span>
          <span className="text-gray-400 text-xs md:text-sm max-w-[120px] md:max-w-[180px] truncate block min-w-0">
            {usuario?.nombre || 'Administrador'}
          </span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-1 md:ml-0">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}