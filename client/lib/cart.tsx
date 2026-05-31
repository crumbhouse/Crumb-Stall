"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FoodItem } from "@/lib/catalog";

type CartItem = {
  item: FoodItem;
  quantity: number;
  note: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  addItem: (item: FoodItem) => void;
  removeItem: (itemId: string) => void;
  increaseItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  updateItemNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  getQuantity: (itemId: string) => number;
};

const TAX_RATE = 0.05;
const STORAGE_KEY = "crumbstall-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsedItems = JSON.parse(savedCart) as Array<Partial<CartItem>>;
        setItems(
          parsedItems.flatMap((cartItem) => {
            if (!cartItem.item || !cartItem.quantity) {
              return [];
            }

            return {
              item: cartItem.item,
              quantity: cartItem.quantity,
              note: cartItem.note ?? "",
            };
          }),
        );
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  const addItem = useCallback((item: FoodItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.item.id === item.id);

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...currentItems, { item, quantity: 1, note: "" }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) => currentItems.filter((cartItem) => cartItem.item.id !== itemId));
  }, []);

  const increaseItem = useCallback((itemId: string) => {
    setItems((currentItems) =>
      currentItems.map((cartItem) =>
        cartItem.item.id === itemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
      ),
    );
  }, []);

  const decreaseItem = useCallback((itemId: string) => {
    setItems((currentItems) =>
      currentItems.flatMap((cartItem) => {
        if (cartItem.item.id !== itemId) {
          return cartItem;
        }

        if (cartItem.quantity <= 1) {
          return [];
        }

        return { ...cartItem, quantity: cartItem.quantity - 1 };
      }),
    );
  }, []);

  const updateItemNote = useCallback((itemId: string, note: string) => {
    setItems((currentItems) =>
      currentItems.map((cartItem) =>
        cartItem.item.id === itemId ? { ...cartItem, note: note.slice(0, 120) } : cartItem,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getQuantity = useCallback(
    (itemId: string) => items.find((cartItem) => cartItem.item.id === itemId)?.quantity ?? 0,
    [items],
  );

  const value = useMemo(() => {
    const subtotal = items.reduce(
      (sum, cartItem) => sum + cartItem.item.finalPrice * cartItem.quantity,
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE);

    return {
      items,
      itemCount: items.reduce((sum, cartItem) => sum + cartItem.quantity, 0),
      subtotal,
      tax,
      total: subtotal + tax,
      addItem,
      removeItem,
      increaseItem,
      decreaseItem,
      updateItemNote,
      clearCart,
      getQuantity,
    };
  }, [
    addItem,
    clearCart,
    decreaseItem,
    getQuantity,
    increaseItem,
    items,
    removeItem,
    updateItemNote,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return cart;
}
