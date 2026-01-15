'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Button } from './ui/button';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from './ui/button';

const getEmojiForCategory = (category: string) => {
  switch (category) {
    case 'burgers': return '🍔';
    case 'drinks': return '🥤';
    case 'snacks': return '🍟';
    case 'sauces': return '🥄';
    default: return '🍽️';
  }
};

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const router = useRouter();
  const [isMounting, setIsMounting] = useState(false);

  // Handle animation mounting
  useEffect(() => {
    if (isOpen) setIsMounting(true);
    else setTimeout(() => setIsMounting(false), 300); // Wait for animation
  }, [isOpen]);

  if (!isOpen && !isMounting) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center pointer-events-none transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
    >
       {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "bg-white w-full max-w-md rounded-t-3xl h-[85vh] flex flex-col shadow-2xl pointer-events-auto transition-transform duration-300 ease-out transform",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-3xl">
          <h2 className="font-bold text-xl flex items-center gap-2 text-gray-900">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Корзина
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-900">
            Закрыть
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                 <ShoppingBag className="w-8 h-8 opacity-20" />
              </div>
              <p>В корзине пусто</p>
              <Button onClick={onClose} variant="outline" className="rounded-xl">Перейти к меню</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                   {item.productImage ? (
                      <img src={item.productImage} className="w-full h-full object-cover" alt="" />
                   ) : (
                      <span className="text-2xl">🍽️</span>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 truncate pr-2">
                       {item.productName}
                    </h4>
                    <span className="font-bold text-gray-900 whitespace-nowrap">{item.totalPrice * item.quantity} ₽</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
                    {item.selectedIngredients.length > 0 
                      ? item.selectedIngredients.map(i => i.name).join(', ') 
                      : 'Классический состав'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-white text-gray-500"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-white text-gray-500"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white pb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Итого</span>
              <span className="font-bold text-2xl text-gray-900">{totalPrice()} ₽</span>
            </div>
            <Button 
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200 flex items-center justify-center gap-2" 
              onClick={handleCheckout}
            >
              <span>Оформить заказ</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
