import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border bg-white p-6 shadow-sm">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex items-center justify-between">{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}




