"use client";
import React from 'react';
import { FiHome, FiTruck, FiPackage, FiUsers, FiDollarSign, FiSettings, FiLogOut, FiMenu, FiSearch, FiBell } from 'react-icons/fi';

const stats = [
  { name: 'Ventas del día', value: '2,345', change: '+12%', changeType: 'increase' },
  { name: 'Órdenes activas', value: '18', change: '+2', changeType: 'increase' },
  { name: 'Clientes nuevos', value: '5', change: '+1', changeType: 'increase' },
  { name: 'Ingresos', value: '$12,345', change: '+8%', changeType: 'increase' },
];

const recentOrders = [
  { id: 1, customer: 'Juan Pérez', address: 'Av. Principal #123', amount: 150, status: 'En ruta' },
  { id: 2, customer: 'María González', address: 'Calle 7 #45-67', amount: 200, status: 'Pendiente' },
  { id: 3, customer: 'Carlos López', address: 'Carrera 8 #12-34', amount: 180, status: 'Entregado' },
  { id: 4, customer: 'Ana Martínez', address: 'Diagonal 15 #23-45', amount: 210, status: 'En ruta' },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                DG
              </div>
              <span className="ml-2 text-lg font-semibold">Despacho Gas</span>
            </div>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md group">
                <FiHome className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md group">
                <FiTruck className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Órdenes
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md group">
                <FiPackage className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Inventario
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md group">
                <FiUsers className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Clientes
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md group">
                <FiDollarSign className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Ventas
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md group">
                <FiSettings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Configuración
              </a>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md">
              <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <button className="md:hidden p-2 text-gray-500 hover:text-gray-600 focus:outline-none">
                <FiMenu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar..."
                />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-600 focus:outline-none">
                <FiBell className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">AD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stat.value}
                            <span className={`ml-2 text-sm font-normal ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ventas mensuales</h2>
              <div className="h-64">
                <div className="h-full flex items-center justify-center text-gray-500">
                  Gráfico de ventas mensuales
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Distribución por producto</h2>
              <div className="h-64">
                <div className="h-full flex items-center justify-center text-gray-500">
                  Gráfico de distribución
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Órdenes recientes</h2>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Ver todas</a>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.customer}</p>
                        <p className="text-sm text-gray-500 truncate">{order.address}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">${order.amount}</p>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
