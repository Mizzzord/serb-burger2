'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminScanner() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (scanResult) return; // Prevent multiple scans

    // Expected format: ORDER:1234
    if (decodedText.startsWith('ORDER:')) {
      const orderId = decodedText.split(':')[1];
      setScanResult(orderId);
      
      try {
        // Send request to archive/complete order
        const response = await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: 'completed' }),
        });

        if (response.ok) {
          // Success!
          if (scannerRef.current) scannerRef.current.pause();
        } else {
          setError('Ошибка при обработке заказа');
        }
      } catch (err) {
        setError('Сетевая ошибка');
      }
    } else {
      setError('Неверный формат QR-кода');
    }
  }

  function onScanFailure(error: any) {
    // Ignore frequent scan failures (common during scanning)
  }

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    if (scannerRef.current) scannerRef.current.resume();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-black text-gray-900">Сканер выдачи</h2>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-6">
        {!scanResult && !error ? (
          <div className="space-y-4">
            <div id="reader" className="overflow-hidden rounded-3xl border-2 border-gray-50 shadow-inner"></div>
            <p className="text-center text-sm text-gray-400 font-medium">
              Наведите камеру на QR-код клиента для подтверждения выдачи
            </p>
          </div>
        ) : scanResult ? (
          <div className="py-10 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Заказ #{scanResult} выдан</h3>
              <p className="text-gray-500">Заказ успешно заархивирован и убран из очереди</p>
            </div>
            <Button onClick={resetScanner} className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold gap-2">
              <RefreshCw className="w-4 h-4" />
              Сканировать еще
            </Button>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center text-center space-y-6 animate-in shake duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Ошибка</h3>
              <p className="text-red-500 font-medium">{error}</p>
            </div>
            <Button onClick={resetScanner} variant="outline" className="w-full h-14 rounded-2xl font-bold">
              Попробовать снова
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

