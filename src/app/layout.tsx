import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import SidebarWrapper from '../components/layout/SidebarWrapper';
import Topbar from '../components/layout/Topbar';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Despacho Gas',
  description: 'Plataforma de Despacho Inteligente de Gas'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen">
              <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
            </div>
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


