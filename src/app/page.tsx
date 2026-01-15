'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { INGREDIENTS } from '@/data/menu';
import { ProductCard } from '@/components/product-card';
import { ProductCustomizer } from '@/components/product-customizer';
import { CartDrawer } from '@/components/cart-drawer';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Category, Product, Ingredient } from '@/types';
import { cn } from '@/components/ui/button';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'burgers', label: 'Бургеры' },
  { id: 'drinks', label: 'Напитки' },
  { id: 'snacks', label: 'Снеки' },
  { id: 'sauces', label: 'Соусы' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('burgers');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const { items, addItem, totalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredProducts = useMemo(() => 
    menuItems.filter(p => p.category === activeCategory),
  [activeCategory, menuItems]);

  const handleAddToCart = (product: Product, ingredients: Ingredient[]) => {
    addItem(product, ingredients);
    setCustomizingProduct(null);
    // Optional: Open cart or show toast? 
    // User flow: "Add to cart" -> Close modal. Maybe show cart drawer briefly or just update counter.
  };

  const handleProductClick = (product: Product) => {
    setCustomizingProduct(product);
  };

  return (
    <main className="min-h-screen pb-28">
      {/* Header / Logo */}
      <header className="bg-white p-4 sticky top-0 z-20 border-b border-gray-100/50 backdrop-blur-lg bg-white/80">
        <h1 className="text-xl font-black tracking-tight text-gray-900">SERB <span className="text-orange-600">BURGER</span></h1>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[61px] z-10 bg-gray-50/95 backdrop-blur pt-2 pb-4 overflow-x-auto no-scrollbar">
        <div className="flex px-4 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95",
                activeCategory === cat.id
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-100"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          В этой категории пока пусто
        </div>
      )}

      {/* Floating Cart Button */}
      {mounted && items.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30">
          <Button 
            className="w-full h-16 shadow-xl shadow-orange-500/20 rounded-2xl flex items-center justify-between px-6 text-lg animate-in slide-in-from-bottom duration-300 bg-gray-900 text-white hover:bg-gray-800"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                 <ShoppingBag className="w-6 h-6" />
                 <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-gray-900">
                   {items.length}
                 </span>
              </div>
              <span className="font-bold">Корзина</span>
            </div>
            <span className="font-bold text-xl">{totalPrice()} ₽</span>
          </Button>
        </div>
      )}

      {/* Modals */}
      {customizingProduct && (
        <ProductCustomizer
          product={customizingProduct}
          isOpen={!!customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      </main>
  );
}
