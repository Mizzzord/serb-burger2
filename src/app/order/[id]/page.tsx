'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home } from 'lucide-react';
import { useOrderStore } from '@/store/order-store';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { clearOrder } = useOrderStore();

  const handleFinish = () => {
    clearOrder();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 text-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-in zoom-in">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ принят!</h1>
        <p className="text-gray-500 mb-8 font-medium">Покажите этот QR-код на кассе или в зоне выдачи</p>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 mb-8 w-full flex flex-col items-center border border-gray-100">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">Номер заказа</div>
          <div className="text-5xl font-black text-gray-900 mb-8 tracking-tighter">#{orderId}</div>
          
          <div className="bg-white p-4 rounded-3xl border-2 border-gray-50 shadow-inner">
            <QRCodeSVG value={`ORDER:${orderId}`} size={200} level="H" />
          </div>
          
          <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-2xl text-sm font-bold border border-orange-100/50 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Готовится
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3 pb-8">
        <Button 
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gray-900 text-white shadow-xl shadow-gray-200"
          onClick={handleFinish}
        >
          Я получил заказ
        </Button>
        <Button 
          variant="ghost" 
          className="w-full h-12 text-gray-500 font-bold gap-2"
          onClick={() => router.push('/')}
        >
          <Home className="w-4 h-4" />
          Вернуться в меню
        </Button>
      </div>
    </div>
  );
}

