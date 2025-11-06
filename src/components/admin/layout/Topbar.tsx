import { Bell, UserCircle } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-medium text-gray-800">Panel de Administración</h2>
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
