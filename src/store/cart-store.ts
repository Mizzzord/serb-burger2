import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Ingredient } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, ingredients: Ingredient[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, ingredients) => {
        const itemTotal = product.price + ingredients.reduce((sum, ing) => sum + ing.price, 0);
        
        // Generate a pseudo-unique ID for the cart item based on content
        const ingredientsKey = ingredients.map(i => i.id).sort().join('-');
        const newItemId = `${product.id}-${ingredientsKey}-${Date.now()}`;

        set((state) => ({
          items: [
            ...state.items,
            {
              id: newItemId,
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              quantity: 1,
              selectedIngredients: ingredients,
              totalPrice: itemTotal
            }
          ]
        }));
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId)
        }));
      },
      updateQuantity: (itemId, delta) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === itemId) {
              const newQuantity = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        }));
      },
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
      }
    }),
    {
      name: 'serb-burger-cart',
    }
  )
);
