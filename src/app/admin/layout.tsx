'use client';

import React from 'react';
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { LayoutDashboard, QrCode, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      <meta name="theme-color" content="#f97316" />
      <link rel="manifest" href="/manifest.json" />
      <div className={`${inter.className} min-h-screen bg-gray-100 flex flex-col`}>
        <div className="flex-1 flex flex-col md:flex-row">
          <aside className="bg-gray-900 text-white w-full md:w-64 flex-shrink-0 z-50">
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white">S</div>
              <h1 className="font-bold text-xl tracking-tight">Админ-панель</h1>
            </div>
            
            <nav className="flex md:flex-col p-4 gap-2 overflow-x-auto md:overflow-visible">
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap min-w-max md:min-w-0"
              >
                <LayoutDashboard className="w-5 h-5 text-orange-500" />
                <span>Заказы</span>
              </Link>
              <Link 
                href="/admin/scanner" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap min-w-max md:min-w-0"
              >
                <QrCode className="w-5 h-5 text-orange-500" />
                <span>Сканер QR</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors md:mt-auto text-left whitespace-nowrap min-w-max md:min-w-0"
              >
                <LogOut className="w-5 h-5" />
                <span>Выход</span>
              </button>
            </nav>
          </aside>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
