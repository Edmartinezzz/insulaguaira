'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClienteRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al dashboard correcto
    router.replace('/cliente/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}
