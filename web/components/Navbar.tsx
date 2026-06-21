'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, LayoutDashboard, Package, Boxes, Users, DollarSign, BarChart3, Settings, LogOut } from 'lucide-react';

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

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between overflow-x-auto">
      <div className="flex items-center gap-3 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Power<span className="text-orange-500">POS</span></h1>
        <span className="text-gray-500 text-sm">|</span>
        <span className="text-gray-400 text-sm whitespace-nowrap">{usuario?.empresa}</span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {ITEMS.map((item) => {
          const activo = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-2 text-sm transition-colors whitespace-nowrap ${
                activo ? 'text-orange-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
        <span className="text-gray-500 text-sm">|</span>
        <span className="text-gray-400 text-sm whitespace-nowrap">{usuario?.nombre}</span>
        <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}