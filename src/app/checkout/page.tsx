'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, Loader2, Wallet, Check } from 'lucide-react';
import { processPayment } from '@/lib/payment';
import { cn } from '@/components/ui/button';
import { useOrderStore } from '@/store/order-store';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { setActiveOrder } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = totalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-400 mb-6 text-lg">Корзина пуста</p>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl px-8">
          Вернуться в меню
        </Button>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await processPayment(total, paymentMethod);

      if (result.success) {
        // Реальный запрос на создание заказа в нашей БД
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              selectedIngredients: i.selectedIngredients.map(ing => ({ id: ing.id, price: ing.price })),
              totalPrice: i.totalPrice
            })),
            totalAmount: total,
            paymentMethod
          })
        });

        const orderData = await orderResponse.json();
        const orderId = orderData.orderId || Math.floor(1000 + Math.random() * 9000);
        
        // Update Active Order Store
        setActiveOrder({
          id: result.transactionId || orderId.toString(),
          number: orderId,
          status: 'preparing'
        });

        clearCart();

        // If WATA provided a redirect URL, go there
        if (result.checkoutUrl && result.checkoutUrl !== '#mock-payment') {
          window.location.href = result.checkoutUrl;
        } else {
          router.push(`/order/${orderId}`);
        }
      } else {
        setError(result.error || 'Ошибка оплаты');
      }
    } catch (e) {
      setError('Произошла ошибка при обработке заказа');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <header className="bg-white p-4 sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900">Оформление заказа</h1>
      </header>

      <div className="p-5 space-y-6 max-w-lg mx-auto">
        {/* Order Summary */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Ваш заказ</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex-1 pr-4">
                  <span className="text-gray-900 font-medium block">{item.productName}</span>
                  <span className="text-xs text-gray-500">x{item.quantity}</span>
                </div>
                <span className="font-bold text-gray-900">{item.totalPrice} ₽</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center mt-4">
              <span className="font-bold text-gray-900 text-lg">Итого</span>
              <span className="font-black text-2xl text-orange-600">{total} ₽</span>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="font-bold text-gray-900 mb-4 text-lg px-2">Способ оплаты</h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={cn(
                "relative flex items-center p-4 rounded-2xl border-2 transition-all text-left group",
                paymentMethod === 'card' 
                  ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-200" 
                  : "border-gray-100 bg-white text-gray-900 hover:border-gray-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors",
                paymentMethod === 'card' ? "bg-white/10" : "bg-gray-100"
              )}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold block text-base">Картой онлайн</span>
                <span className={cn("text-xs opacity-80", paymentMethod === 'card' ? "text-gray-300" : "text-gray-500")}>WATA Pay / Apple Pay</span>
              </div>
              {paymentMethod === 'card' && <Check className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                "relative flex items-center p-4 rounded-2xl border-2 transition-all text-left group",
                paymentMethod === 'cash' 
                  ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-200" 
                  : "border-gray-100 bg-white text-gray-900 hover:border-gray-200",
                 total > 500 && "opacity-60 cursor-not-allowed bg-gray-50 border-transparent"
              )}
              disabled={total > 500}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors",
                paymentMethod === 'cash' ? "bg-white/10" : "bg-gray-100"
              )}>
                <Banknote className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold block text-base">Наличными</span>
                <span className={cn("text-xs opacity-80", paymentMethod === 'cash' ? "text-gray-300" : "text-gray-500")}>
                  {total > 500 ? "Недоступно для заказов > 500 ₽" : "Оплата при получении"}
                </span>
              </div>
              {paymentMethod === 'cash' && <Check className="w-5 h-5" />}
            </button>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-10 max-w-lg mx-auto">
        <Button 
          className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200 transition-all active:scale-[0.98]" 
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Обработка...</span>
            </div>
          ) : (
            <span>Оплатить {total} ₽</span>
          )}
        </Button>
      </div>
    </div>
  );
}
