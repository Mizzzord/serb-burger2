'use client';

import React from 'react';
import { useOrderStore } from '@/store/order-store';
import { ChevronRight, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export const ActiveOrderBanner = () => {
  const { activeOrder, clearOrder } = useOrderStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeOrder) return null;

  const statusLabels: Record<string, string> = {
    pending: 'Принят',
    preparing: 'Готовится',
    ready: 'Готов к выдаче',
    completed: 'Выполнен',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-blue-500',
    preparing: 'bg-orange-500',
    ready: 'bg-green-500',
    completed: 'bg-gray-500',
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearOrder();
  };

  return (
    <div className="sticky top-0 z-[100] bg-gray-900 animate-in slide-in-from-top duration-300">
      <div className="max-w-lg mx-auto flex items-center">
        <Link 
          href={`/order/${activeOrder.number}`}
          className="flex-1 flex items-center justify-between p-3 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">
                Активный заказ #{activeOrder.number}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusColors[activeOrder.status]} animate-pulse`} />
                <span className="text-sm font-bold">{statusLabels[activeOrder.status]}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-full w-12 rounded-none text-gray-500 hover:text-white hover:bg-white/5 border-l border-white/10"
          onClick={handleClear}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

