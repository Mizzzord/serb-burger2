import React, { useEffect, useState } from 'react';
import { Product, Ingredient } from '@/types';
import { Button } from './ui/button';
import { INGREDIENTS } from '@/data/menu';
import { X, Check, Info } from 'lucide-react';
import { cn } from '@/components/ui/button';

const getEmojiForCategory = (category: string) => {
  switch (category) {
    case 'burgers': return '🍔';
    case 'drinks': return '🥤';
    case 'snacks': return '🍟';
    case 'sauces': return '🥄';
    default: return '🍽️';
  }
};

interface ProductCustomizerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedIngredients: Ingredient[]) => void;
}

export const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart 
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);

  // Initialize defaults
  useEffect(() => {
    if (product.baseIngredients) {
      const defaults = product.baseIngredients
        .map(id => INGREDIENTS[id])
        .filter(Boolean);
      setSelectedIngredients(defaults);
    } else {
      setSelectedIngredients([]);
    }
  }, [product]);

  if (!isOpen) return null;

  const toggleIngredient = (id: string) => {
    const ing = INGREDIENTS[id];
    if (!ing) return;

    const isSelected = selectedIngredients.some(i => i.id === id);

    if (isSelected) {
      setSelectedIngredients(prev => prev.filter(i => i.id !== id));
    } else {
      if (ing.type === 'bun') {
        setSelectedIngredients(prev => [
          ...prev.filter(i => i.type !== 'bun'),
          ing
        ]);
      } else {
        setSelectedIngredients(prev => [...prev, ing]);
      }
    }
  };

  const currentPrice = product.price + selectedIngredients.reduce((sum, i) => sum + i.price, 0);

  // Group ingredients
  const allRelevantIngredientIds = Array.from(new Set([
    ...(product.baseIngredients || []),
    ...(product.availableIngredients || [])
  ]));

  const hasOptions = allRelevantIngredientIds.length > 0;

  const ingredientsByType: Record<string, Ingredient[]> = {};
  allRelevantIngredientIds.forEach(id => {
    const ing = INGREDIENTS[id];
    if (ing) {
      if (!ingredientsByType[ing.type]) ingredientsByType[ing.type] = [];
      ingredientsByType[ing.type].push(ing);
    }
  });

  const typeLabels: Record<string, string> = {
    bun: 'Булочка',
    patty: 'Котлета',
    cheese: 'Сыр',
    vegetable: 'Овощи',
    sauce: 'Соусы',
    addon: 'Добавки'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-3xl h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
        
        {/* Header Image Area */}
        <div className="relative h-48 bg-gray-100 rounded-t-3xl flex-shrink-0 flex items-center justify-center overflow-hidden">
           {product.image ? (
             <img
               src={product.image}
               className="w-full h-full object-cover"
               alt={product.name}
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = getEmojiForCategory(product.category);
               }}
             />
           ) : (
             <span className="text-8xl">{getEmojiForCategory(product.category)}</span>
           )}
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-white/50 backdrop-blur-md rounded-full hover:bg-white text-black"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-6">
            <h2 className="font-bold text-2xl text-gray-900 mb-2">{product.name}</h2>
            {product.description && (
              <p className="text-gray-500 leading-relaxed">{product.description}</p>
            )}
          </div>
          
          {hasOptions ? (
            <div className="space-y-6">
              {Object.entries(ingredientsByType).map(([type, ingredients]) => (
                <div key={type}>
                  <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">{typeLabels[type] || type}</h3>
                  <div className="space-y-2">
                    {ingredients.map(ing => {
                      const isSelected = selectedIngredients.some(i => i.id === ing.id);
                      return (
                        <div 
                          key={ing.id} 
                          onClick={() => toggleIngredient(ing.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer active:scale-[0.99]",
                            isSelected 
                              ? "border-orange-500 bg-orange-50/50" 
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                              isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 bg-white"
                            )}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span className={cn("text-sm", isSelected ? "font-medium text-gray-900" : "text-gray-600")}>
                              {ing.name}
                            </span>
                          </div>
                          {ing.price > 0 && (
                            <span className="text-sm font-medium text-gray-500">
                              +{ing.price} ₽
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Для этого товара нет дополнительных опций. Вы можете добавить его в корзину как есть.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white pb-8">
          <Button 
            className="w-full h-14 text-lg font-bold flex items-center justify-between px-6 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-[0.98]"
            onClick={() => onAddToCart(product, selectedIngredients)}
          >
            <span>В корзину</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg">
              {currentPrice} ₽
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
