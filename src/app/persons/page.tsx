"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';

export default function PersonsPage() {
  const [persons, setPersons] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [queryPhone, setQueryPhone] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    axios.get('/api/persons').then(r => setPersons(r.data)).catch(() => setPersons([]));
    axios.get('/api/inventory').then(r => setInventories(r.data)).catch(() => setInventories([]));
  }, []);

  function findByPhone() {
    const p = persons.find(x => x.phone === queryPhone);
    setSelected(p || null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar persona</CardTitle>
        </CardHeader>
        <div className="p-4 flex items-center gap-2">
          <input className="border rounded px-2 py-1" placeholder="Teléfono" value={queryPhone} onChange={e => setQueryPhone(e.target.value)} />
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={findByPhone}>Buscar</button>
        </div>
        <div className="p-4">
          {selected ? (
            <div>
              <div className="text-lg font-semibold">{selected.name}</div>
              <div className="text-sm text-gray-600">Tel: {selected.phone}</div>
              <div className="mt-2">Balance: <strong>{selected.litersBalance} L</strong></div>
              <div className="mt-2 text-sm text-gray-700">Sector: {selected.sector?.name || '—'}</div>
              <div className="mt-3">
                <div className="text-sm font-medium">Inventario del sector</div>
                <div className="text-sm text-gray-700">{(inventories.find(i => i.sectorId === selected.sectorId)?.litersAvailable ?? 'N/A')} L disponibles</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Introduce un teléfono y pulsa Buscar para ver el balance</div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sectores y disponibilidad</CardTitle>
        </CardHeader>
        <div className="p-4 space-y-2">
          {inventories.map(inv => (
            <div key={inv.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{inv.sector?.name}</div>
                <div className="text-sm text-gray-600">Última: {new Date(inv.updatedAt).toLocaleString()}</div>
              </div>
              <div className="font-semibold">{inv.litersAvailable} L</div>
            </div>
          ))}
          {inventories.length === 0 && <div className="text-sm text-gray-500">Sin datos</div>}
        </div>
      </Card>
    </div>
  );
}
