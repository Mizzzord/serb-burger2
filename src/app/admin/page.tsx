'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, Banknote, ChevronDown, ChevronUp, Package, CheckCircle2, Settings } from 'lucide-react';
import { cn } from '@/components/ui/button';
import Link from 'next/link';

interface OrderItem {
  productName: string;
  quantity: number;
  totalPrice: number;
  selectedIngredients: { name: string }[];
}

interface Order {
  id: string;
  number: number;
  totalAmount: number;
  paymentMethod: 'card' | 'cash';
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  items: OrderItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Поллинг каждые 5с для тестирования
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      fetchOrders(); // Refresh immediately
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedOrders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedOrders(next);
  };

  const statusOptions = [
    { value: 'pending', label: 'Новый', color: 'bg-blue-50 text-blue-600' },
    { value: 'preparing', label: 'Готовится', color: 'bg-orange-50 text-orange-600' },
    { value: 'ready', label: 'Готов', color: 'bg-green-50 text-green-600' },
    { value: 'completed', label: 'Выдан (В архив)', color: 'bg-gray-100 text-gray-600' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">Загрузка...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 px-2">Заказы сегодня</h2>
        <div className="flex gap-2">
          <Link href="/admin/menu">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Меню
            </Button>
          </Link>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            {orders.length} активных
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const currentStatus = statusOptions.find(s => s.value === order.status);
          
          return (
            <div 
              key={order.id} 
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
            >
              {/* Order Header */}
              <div 
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-900 text-lg border border-gray-100">
                    #{order.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{order.totalAmount} ₽</span>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                        {order.paymentMethod === 'card' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                        {order.paymentMethod === 'card' ? 'Карта' : 'Наличные'}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider",
                    currentStatus?.color
                  )}>
                    {currentStatus?.label}
                  </div>
                  {expandedOrders.has(order.id) ? <ChevronUp className="w-5 h-5 text-gray-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrders.has(order.id) && (
                <div className="px-5 pb-5 border-t border-gray-50 bg-gray-50/30 animate-in slide-in-from-top-2 duration-200">
                  <div className="py-4 space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Package className="w-3 h-3" /> Состав заказа
                    </h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm text-gray-900">
                            {item.productName} <span className="text-gray-400 font-normal ml-1">x{item.quantity}</span>
                          </div>
                          {item.selectedIngredients.length > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.selectedIngredients.map(i => i.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-sm text-gray-900">{item.totalPrice * item.quantity} ₽</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Статус заказа</span>
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 focus:border-orange-500 focus:ring-0 outline-none cursor-pointer appearance-none min-w-[140px] text-center shadow-sm"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Нет активных заказов</p>
          </div>
        )}
      </div>
    </div>
  );
}
