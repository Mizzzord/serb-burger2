'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // В реальности здесь был бы запрос к API для установки сессии/куки
    // Для MVP используем проверку через API или простую куку
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Вход в панель</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Доступ только для персонала</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full h-14 bg-gray-50 border-2 ${error ? 'border-red-500' : 'border-transparent'} rounded-2xl px-6 outline-none focus:border-orange-500 transition-all font-bold text-center`}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center mt-2 font-bold">Неверный пароль</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
}

