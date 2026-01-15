'use client';

import React, { useEffect, useState } from 'react';

export const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500); // 1.5 seconds loading simulation

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards">
      <div className="relative flex flex-col items-center">
        {/* Animated Burger Icon */}
        <div className="text-6xl mb-4 animate-bounce">🍔</div>
        
        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-black tracking-tighter text-gray-900">
            SERB <span className="text-orange-600">BURGER</span>
          </h1>
          <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="w-full h-full bg-orange-500 origin-left animate-loading-bar" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
            Готовим вашу плескавицу...
          </span>
        </div>
      </div>
    </div>
  );
};

