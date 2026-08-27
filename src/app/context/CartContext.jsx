"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as cartService from "@/lib/services/cartService";
import { useAuth } from "../store/AuthStore";

/**
 * Cart with two backing stores.
 *
 *   Signed out — localStorage, so someone can fill a basket without an
 *                account and still have it after a reload.
 *   Signed in  — the server cart (/api/cart), so the basket follows the user
 *                between devices and the backend can enforce stock.
 *
 * Signing in MERGES the guest basket into the server cart and then empties the
 * local one, so nothing is silently lost at the moment of login. Signing out
 * drops the local copy of the server cart rather than writing it back to
 * localStorage — the next person on this machine must not inherit it.
 *
 * The shape handed to the UI is identical in both modes, so CartDrawer never
 * has to know which one is live.
 */
const CartContext = createContext(null);
const STORAGE_KEY = "ck-cart-v1";

/** Server cart item -> the flat shape the drawer renders. */
const fromServer = (item) => ({
  itemId: item.id,
  id: item.product.id,
  slug: item.product.slug,
  name: item.product.name,
  type: item.product.type || "",
  price: item.price,
  mrp: item.product.mrp ?? null,
  image: item.product.image,
  kind: item.product.kind || "stationery",
  qty: item.quantity,
});

/** Product -> a guest cart line. */
const toLocal = (product, qty) => ({
  id: product.id || "",
  slug: product.slug,
  name: product.name,
  type: product.type || "",
  price: product.price,
  mrp: product.mrp ?? null,
  image: product.image,
  kind: product.kind || "stationery",
  qty,
});

export function CartProvider({ children }) {
  const { isAuthenticated, restoring, getToken, authedCall } = useAuth();

  const [localItems, setLocalItems] = useState([]);
  const [serverItems, setServerItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Guards the first save so an empty initial state can't wipe a stored cart.
  const [hydrated, setHydrated] = useState(false);

  const merged = useRef(false);

  // Load the guest cart once on mount. Starting from [] on both server and
  // client keeps the first render identical, so there's no hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLocalItems(parsed);
      }
    } catch {
      // private mode / blocked storage — carry on with an empty cart
    }
    setHydrated(true);
  }, []);

  // Persist the guest cart only. A signed-in basket lives on the server.
  useEffect(() => {
    if (!hydrated || isAuthenticated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems));
    } catch {
      // ignore quota / blocked storage
    }
  }, [localItems, hydrated, isAuthenticated]);

  const loadServerCart = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const cart = await authedCall((t) => cartService.getCart(t));
      setServerItems(cart.items.map(fromServer));
    } catch (err) {
      setError(err?.message || "Could not load your cart.");
    }
  }, [getToken, authedCall]);

  // Sign in: merge the guest basket up, then read the server cart back.
  useEffect(() => {
    if (restoring || !isAuthenticated || !hydrated || merged.current) return;
    merged.current = true;

    (async () => {
      const token = getToken();
      if (!token) return;

      setBusy(true);
      // Items saved before products carried ids cannot be matched to a
      // product server-side; everything else moves up.
      const movable = localItems.filter((item) => item.id);

      for (const item of movable) {
        try {
          await authedCall((t) =>
            cartService.addToCart(t, {
              productId: item.id,
              quantity: item.qty,
            })
          );
        } catch {
          // Out of stock or gone — skip it rather than block the merge.
        }
      }

      // Drop the guest key whether or not anything moved — while signed in the
      // basket lives on the server, so an empty local copy is just clutter.
      if (localItems.length) setLocalItems([]);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }

      await loadServerCart();
      setBusy(false);
    })();
  }, [isAuthenticated, restoring, hydrated, localItems, getToken, loadServerCart]);

  // Sign out: forget the server basket, and allow a merge on the next login.
  useEffect(() => {
    if (isAuthenticated) return;
    merged.current = false;
    setServerItems([]);
  }, [isAuthenticated]);

  const items = isAuthenticated ? serverItems : localItems;

  const findItem = useCallback(
    (slug) => items.find((item) => item.slug === slug),
    [items]
  );

  /** Runs a server cart call, surfaces its message, and reloads the cart. */
  const run = useCallback(
    async (action) => {
      const token = getToken();
      if (!token) return { ok: false };

      setBusy(true);
      setError("");
      try {
        await authedCall((t) => action(t));
        await loadServerCart();
        return { ok: true };
      } catch (err) {
        // "Only 3 units available" and friends come from the backend.
        const message = err?.message || "Something went wrong.";
        setError(message);
        return { ok: false, message };
      } finally {
        setBusy(false);
      }
    },
    [getToken, authedCall, loadServerCart]
  );

  const add = useCallback(
    async (product, qty = 1) => {
      setOpen(true);

      if (!isAuthenticated) {
        setLocalItems((current) => {
          const found = current.find((i) => i.slug === product.slug);
          if (found) {
            return current.map((i) =>
              i.slug === product.slug ? { ...i, qty: i.qty + qty } : i
            );
          }
          return [...current, toLocal(product, qty)];
        });
        return { ok: true };
      }

      return run((token) =>
        cartService.addToCart(token, { productId: product.id, quantity: qty })
      );
    },
    [isAuthenticated, run]
  );

  const setQty = useCallback(
    async (slug, qty) => {
      if (!isAuthenticated) {
        setLocalItems((current) =>
          qty <= 0
            ? current.filter((i) => i.slug !== slug)
            : current.map((i) => (i.slug === slug ? { ...i, qty } : i))
        );
        return { ok: true };
      }

      const item = findItem(slug);
      if (!item) return { ok: false };

      // The backend has no "quantity 0" — that is a removal.
      return qty <= 0
        ? run((token) => cartService.removeCartItem(token, item.itemId))
        : run((token) => cartService.updateCartItem(token, item.itemId, qty));
    },
    [isAuthenticated, findItem, run]
  );

  const remove = useCallback(
    async (slug) => {
      if (!isAuthenticated) {
        setLocalItems((current) => current.filter((i) => i.slug !== slug));
        return { ok: true };
      }

      const item = findItem(slug);
      if (!item) return { ok: false };
      return run((token) => cartService.removeCartItem(token, item.itemId));
    },
    [isAuthenticated, findItem, run]
  );

  const clear = useCallback(async () => {
    if (!isAuthenticated) {
      setLocalItems([]);
      return { ok: true };
    }
    return run((token) => cartService.clearCart(token));
  }, [isAuthenticated, run]);

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
      busy,
      error,
      clearError: () => setError(""),
      /** True while the basket is the server one. */
      isServerCart: isAuthenticated,
    };
  }, [items, open, add, setQty, remove, clear, busy, error, isAuthenticated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
