'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Truck, User, Settings, LogOut } from 'lucide-react';

export function UserSidebar() {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Inicio', href: '/user/dashboard', icon: Home },
    { name: 'Mis Vehículos', href: '/user/vehicles', icon: Truck },
    { name: 'Mi Perfil', href: '/user/profile', icon: User },
    { name: 'Configuración', href: '/user/settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-lg font-semibold text-gray-900">Menú de Usuario</h2>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link
              href="/logout"
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Cerrar sesión
                  </p>
                </div>
                <div className="ml-auto">
                  <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
