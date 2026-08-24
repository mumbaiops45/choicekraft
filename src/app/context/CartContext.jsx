"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ck-cart-v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  // Guards the first save so an empty initial state can't wipe a stored cart.
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. Starting from [] on both server and client keeps the
  // first render identical, so there's no hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // private mode / blocked storage — carry on with an empty cart
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / blocked storage
    }
  }, [items, hydrated]);

  const add = useCallback((product, qty = 1) => {
    setItems((current) => {
      const found = current.find((i) => i.slug === product.slug);
      if (found) {
        return current.map((i) =>
          i.slug === product.slug ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...current,
        {
          slug: product.slug,
          name: product.name,
          type: product.type || "",
          price: product.price,
          mrp: product.mrp ?? null,
          image: product.image,
          kind: product.kind || "stationery",
          qty,
        },
      ];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug, qty) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((i) => i.slug !== slug)
        : current.map((i) => (i.slug === slug ? { ...i, qty } : i))
    );
  }, []);

  const remove = useCallback(
    (slug) => setItems((current) => current.filter((i) => i.slug !== slug)),
    []
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const saved = items.reduce(
      (sum, i) => sum + (i.mrp ? (i.mrp - i.price) * i.qty : 0),
      0
    );
    return {
      items,
      count,
      subtotal,
      saved,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, open, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
