"use client";
import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col bg-black text-white shadow-lg rounded-r-xl">
      <div className="flex flex-col h-full">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="text-xl font-bold">LOGO</div>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600/90 text-white">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/90">
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span>Profile</span>
          </Link>

          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/90">
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span>Notifications</span>
          </Link>

          <Link href="/driver" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/90">
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span>Repartidor</span>
          </Link>
        </nav>

        <div className="px-6 py-6 border-t border-white/10">
          <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-medium">Logout</button>
        </div>
      </div>
    </aside>
  );
}




