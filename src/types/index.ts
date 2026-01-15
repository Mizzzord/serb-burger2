export type Category = string;

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: 'bun' | 'patty' | 'cheese' | 'vegetable' | 'sauce' | 'addon';
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  price: number;
  category: Category;
  ingredients?: any[]; // Allow generic ingredients structure from API
  baseIngredients?: string[]; // IDs of default ingredients
  availableIngredients?: string[]; // IDs of ingredients that can be added/swapped
}

export interface CartItem {
  id: string; // Unique ID for cart item (e.g. productID + hash of options)
  productId: string;
  productName: string; // Cached name
  productImage?: string | null; // Cached image
  quantity: number;
  selectedIngredients: Ingredient[]; // Full list of actual ingredients in this item
  totalPrice: number;
}

export interface Order {
  id: string;
  number: number;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  paymentMethod: 'card' | 'cash'; // 'card' implies WATA or other online
  createdAt: string;
}

