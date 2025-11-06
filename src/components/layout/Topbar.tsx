"use client";
import React from 'react';
// no external image required for avatar — use initials placeholder

export default function Topbar() {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
        <div className="flex-1">
          <div className="relative max-w-lg">
            <input
              aria-label="Buscar"
              placeholder="Search"
              className="w-full rounded-full border bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-3 py-2 rounded hover:bg-gray-100">🏠</button>
          <button className="px-3 py-2 rounded hover:bg-gray-100">🔔</button>
          <button id="logoutBtn" className="px-3 py-2 rounded hover:bg-gray-100" onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; } catch (e) { window.location.reload(); } }}>Cerrar sesión</button>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">ROBERT WILLIAM</div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center font-medium">RW</div>
          </div>
        </div>
      </div>
    </header>
  );
}
