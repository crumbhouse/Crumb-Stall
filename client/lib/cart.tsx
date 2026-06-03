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

type Coupon = {
  code: string;
  label: string;
  type: "percentage" | "fixed";
  value: number;
  minimumAmount: number;
};

export type PickupSlot = {
  id: "asap" | "15-min" | "30-min";
  label: string;
  description: string;
  minutesFromNow: number;
};

type CartContextValue = {
  items: CartItem[];
  coupon: Coupon | null;
  couponError: string | null;
  pickupSlot: PickupSlot | null;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  addItem: (item: FoodItem) => void;
  removeItem: (itemId: string) => void;
  increaseItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  updateItemNote: (itemId: string, note: string) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  setPickupSlot: (slot: PickupSlot | null) => void;
  clearCart: () => void;
  getQuantity: (itemId: string) => number;
};

const TAX_RATE = 0.05;
const STORAGE_KEY = "crumbstall-cart";
const COUPON_STORAGE_KEY = "crumbstall-coupon";
const PICKUP_STORAGE_KEY = "crumbstall-pickup-slot";

export const PICKUP_SLOTS: PickupSlot[] = [
  {
    id: "asap",
    label: "ASAP",
    description: "Prepare as soon as possible",
    minutesFromNow: 0,
  },
  {
    id: "15-min",
    label: "15 min",
    description: "Collect after 15 minutes",
    minutesFromNow: 15,
  },
  {
    id: "30-min",
    label: "30 min",
    description: "Collect after 30 minutes",
    minutesFromNow: 30,
  },
];

const COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    label: "10% off on orders above Rs 99",
    type: "percentage",
    value: 10,
    minimumAmount: 99,
  },
  {
    code: "SAVE50",
    label: "Rs 50 off on orders above Rs 299",
    type: "fixed",
    value: 50,
    minimumAmount: 299,
  },
];

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pickupSlot, setPickupSlot] = useState<PickupSlot | null>(null);
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

      const savedCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsedCoupon = JSON.parse(savedCoupon) as Coupon;
        const matchingCoupon = COUPONS.find((couponRule) => couponRule.code === parsedCoupon.code);
        setCoupon(matchingCoupon ?? null);
      }

      const savedPickupSlot = window.localStorage.getItem(PICKUP_STORAGE_KEY);
      if (savedPickupSlot) {
        const parsedPickupSlot = JSON.parse(savedPickupSlot) as PickupSlot;
        const matchingPickupSlot = PICKUP_SLOTS.find((slot) => slot.id === parsedPickupSlot.id);
        setPickupSlot(matchingPickupSlot ?? null);
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

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (coupon) {
      window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      window.localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [coupon, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (pickupSlot) {
      window.localStorage.setItem(PICKUP_STORAGE_KEY, JSON.stringify(pickupSlot));
    } else {
      window.localStorage.removeItem(PICKUP_STORAGE_KEY);
    }
  }, [isReady, pickupSlot]);

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

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponError(null);
    setPickupSlot(null);
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
    const discount = coupon ? calculateDiscount(coupon, subtotal) : 0;
    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = Math.round(taxableAmount * TAX_RATE);

    const applyCoupon = (code: string) => {
      const normalizedCode = code.trim().toUpperCase();
      const matchingCoupon = COUPONS.find((couponRule) => couponRule.code === normalizedCode);

      if (!matchingCoupon) {
        setCoupon(null);
        setCouponError("Coupon code is invalid.");
        return;
      }

      if (subtotal < matchingCoupon.minimumAmount) {
        setCoupon(null);
        setCouponError(`Add Rs ${matchingCoupon.minimumAmount - subtotal} more to use ${matchingCoupon.code}.`);
        return;
      }

      setCoupon(matchingCoupon);
      setCouponError(null);
    };

    return {
      items,
      coupon,
      couponError,
      pickupSlot,
      itemCount: items.reduce((sum, cartItem) => sum + cartItem.quantity, 0),
      subtotal,
      discount,
      tax,
      total: taxableAmount + tax,
      addItem,
      removeItem,
      increaseItem,
      decreaseItem,
      updateItemNote,
      applyCoupon,
      removeCoupon,
      setPickupSlot,
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
    coupon,
    couponError,
    pickupSlot,
    removeItem,
    removeCoupon,
    updateItemNote,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function calculateDiscount(coupon: Coupon, subtotal: number) {
  if (subtotal < coupon.minimumAmount) {
    return 0;
  }

  if (coupon.type === "percentage") {
    return Math.round((subtotal * coupon.value) / 100);
  }

  return Math.min(coupon.value, subtotal);
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return cart;
}
