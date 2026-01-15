import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveOrder {
  id: string;
  number: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
}

interface OrderState {
  activeOrder: ActiveOrder | null;
  setActiveOrder: (order: ActiveOrder | null) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      activeOrder: null,
      setActiveOrder: (order) => set({ activeOrder: order }),
      clearOrder: () => set({ activeOrder: null }),
    }),
    {
      name: 'serb-burger-order',
    }
  )
);

