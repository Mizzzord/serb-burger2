import React from 'react';
import { Product } from '@/types';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
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

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square relative mb-3 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
        {/* Placeholder for real image */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = getEmojiForCategory(product.category);
            }}
          />
        ) : (
           <span className="text-4xl">{getEmojiForCategory(product.category)}</span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">{product.price} ₽</span>
          
          <Button 
            size="sm" 
            className="bg-gray-100 text-gray-900 hover:bg-orange-500 hover:text-white transition-colors rounded-lg px-3 h-8 text-xs font-semibold shadow-none"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
};
