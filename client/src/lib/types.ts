import { Product, CartItem } from "@shared/schema";

export interface CartItemWithProduct extends CartItem {
  product?: Product;
}

export interface CartContextType {
  items: CartItemWithProduct[];
  isLoading: boolean;
  itemCount: number;
  totalAmount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
