"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, THead, TRow, TH, TD } from '../../components/ui/Table';

type Sector = { id: string; name: string };

export default function VehiclesAdminPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, { capacity?: number; litersAvailable?: number; sectorId?: string }>>({});

  useEffect(() => {
    axios.get('/api/admin/sectors').then(r => setSectors(r.data)).catch(() => {});
    fetchVehicles();
  }, []);

  function fetchVehicles() {
    axios.get('/api/vehicles').then(r => setVehicles(r.data)).catch(() => setVehicles([]));
  }

  async function save(id: string) {
    const payload = { id, ...edits[id] } as any;
    try {
      const res = await axios.patch('/api/vehicles', payload);
      setVehicles(vs => vs.map(v => v.id === id ? res.data : v));
      setEdits(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    } catch (err) {
      alert('Error guardando vehículo');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de vehículos</CardTitle>
        </CardHeader>
        <div className="p-4 overflow-x-auto">
          <Table>
            <THead>
              <TRow>
                <TH>Placa</TH>
                <TH>Sector</TH>
                <TH>Capacidad (L)</TH>
                <TH>Litros disponibles</TH>
                <TH>Acciones</TH>
              </TRow>
            </THead>
            <tbody>
              {vehicles.map(v => (
                <TRow key={v.id}>
                  <TD>{v.plate}</TD>
                  <TD>
                    <select className="border rounded px-2 py-1 text-sm" value={edits[v.id]?.sectorId ?? (v.sector?.id ?? '')} onChange={e => setEdits({ ...edits, [v.id]: { ...(edits[v.id] || {}), sectorId: e.target.value } })}>
                      <option value="">Sin sector</option>
                      {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </TD>
                  <TD>
                    <input type="number" className="w-24 border rounded px-2 py-1 text-sm" value={edits[v.id]?.capacity ?? v.capacity} onChange={e => setEdits({ ...edits, [v.id]: { ...(edits[v.id] || {}), capacity: Number(e.target.value) } })} />
                  </TD>
                  <TD>
                    <input type="number" className="w-24 border rounded px-2 py-1 text-sm" value={edits[v.id]?.litersAvailable ?? v.litersAvailable} onChange={e => setEdits({ ...edits, [v.id]: { ...(edits[v.id] || {}), litersAvailable: Number(e.target.value) } })} />
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => save(v.id)}>Guardar</button>
                    </div>
                  </TD>
                </TRow>
              ))}
              {vehicles.length === 0 && (
                <TRow>
                  <TD><div className="text-sm text-gray-500">&nbsp;</div></TD>
                  <TD><div className="text-sm text-gray-500">Sin vehículos</div></TD>
                  <TD><div className="text-sm text-gray-500">&nbsp;</div></TD>
                  <TD><div className="text-sm text-gray-500">&nbsp;</div></TD>
                  <TD><div className="text-sm text-gray-500">&nbsp;</div></TD>
                </TRow>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
