"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type Delivery = {
  id: string;
  order: {
    customerName: string;
    phone: string;
    address: string;
    qty: number;
    gasType: string;
  };
  status: string;
};

export default function DriverApp() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await axios.get('/api/driver/deliveries');
    setDeliveries(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await axios.patch(`/api/driver/deliveries/${id}/status`, { status });
    await load();
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Mis entregas</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {deliveries.map(d => (
          <Card key={d.id}>
            <div className="font-medium">{d.order.customerName} • {d.order.phone}</div>
            <div className="text-sm text-gray-700">{d.order.address}</div>
            <div className="text-sm text-gray-700">{d.order.qty} × {d.order.gasType}</div>
            <div className="mt-3 flex items-center gap-2">
              <Badge>{d.status}</Badge>
              <div className="ml-auto flex gap-2">
                <Button variant="secondary" onClick={() => updateStatus(d.id, 'EN_CAMINO')}>En camino</Button>
                <Button variant="primary" onClick={() => updateStatus(d.id, 'ENTREGADO')}>Entregado</Button>
                <Button variant="danger" onClick={() => updateStatus(d.id, 'FALLIDO')}>Fallido</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


