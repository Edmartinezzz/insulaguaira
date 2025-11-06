"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MyPersonPage() {
  const [person, setPerson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me').then(r => {
      if (r.data.ok && r.data.role === 'person') setPerson(r.data.person);
      else setPerson(null);
    }).catch(() => setPerson(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!person) return <div className="p-4">No has iniciado sesión como persona. Ve a <a href="/login" className="text-blue-600">Login</a></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="text-xl font-semibold">{person.name}</div>
        <div className="text-sm text-gray-600">Tel: {person.phone}</div>
        <div className="mt-2">Balance: <strong>{person.litersBalance} L</strong></div>
        <div className="mt-2 text-sm text-gray-700">Sector: {person.sector?.name || '—'}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-lg font-medium mb-2">Tus vehículos</div>
        {person.vehicles && person.vehicles.length > 0 ? (
          <ul className="space-y-2">
            {person.vehicles.map((v:any) => (
              <li key={v.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{v.plate}</div>
                  <div className="text-sm text-gray-600">Capacidad: {v.capacity} L</div>
                </div>
                <div className="font-semibold">{v.litersAvailable} L</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No tienes vehículos registrados</div>
        )}
      </div>
    </div>
  );
}
