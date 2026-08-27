"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as wishlistService from "@/lib/services/wishlistService";
import { useAuth } from "./AuthStore";

/**
 * Wishlist store.
 *
 * The whole wishlist is loaded once on sign-in, so `has()` answers instantly
 * from the loaded set instead of asking /wishlist/:id per product card. It
 * empties itself on sign-out — one user's wishlist must never linger for the
 * next person on a shared machine.
 */
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, getToken, authedCall } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Product ids mid-request, so a card can show its own pending state.
  const [pending, setPending] = useState([]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { products: found } = await authedCall((t) =>
        wishlistService.getWishlist(t)
      );
      setProducts(found);
    } catch (err) {
      setError(err?.message || "Could not load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [getToken, authedCall]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setProducts([]);
      setError("");
    }
  }, [isAuthenticated, load]);

  const ids = useMemo(
    () => new Set(products.map((product) => product.id)),
    [products]
  );

  const mark = (id, on) =>
    setPending((current) =>
      on ? [...current, id] : current.filter((value) => value !== id)
    );

  const add = useCallback(
    async (product) => {
      const token = getToken();
      if (!token || !product?.id) return { ok: false, message: "Please sign in" };

      mark(product.id, true);
      try {
        await authedCall((t) => wishlistService.addToWishlist(t, product.id));
        // Show it immediately rather than waiting for a full reload.
        setProducts((current) =>
          current.some((item) => item.id === product.id)
            ? current
            : [...current, product]
        );
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err?.message || "Could not add to wishlist" };
      } finally {
        mark(product.id, false);
      }
    },
    [getToken, authedCall]
  );

  const remove = useCallback(
    async (productId) => {
      const token = getToken();
      if (!token || !productId) return { ok: false };

      mark(productId, true);
      try {
        await authedCall((t) => wishlistService.removeFromWishlist(t, productId));
        setProducts((current) =>
          current.filter((item) => item.id !== productId)
        );
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err?.message || "Could not remove" };
      } finally {
        mark(productId, false);
      }
    },
    [getToken, authedCall]
  );

  const toggle = useCallback(
    (product) =>
      ids.has(product?.id) ? remove(product.id) : add(product),
    [ids, add, remove]
  );

  const clear = useCallback(async () => {
    const token = getToken();
    if (!token) return { ok: false };

    const previous = products;
    setProducts([]);
    try {
      await authedCall((t) => wishlistService.clearWishlist(t));
      return { ok: true };
    } catch (err) {
      setProducts(previous); // put it back — the server still has them
      return { ok: false, message: err?.message || "Could not clear wishlist" };
    }
  }, [getToken, authedCall, products]);

  const value = useMemo(
    () => ({
      products,
      count: products.length,
      loading,
      error,
      has: (productId) => ids.has(productId),
      isPending: (productId) => pending.includes(productId),
      add,
      remove,
      toggle,
      clear,
      reload: load,
    }),
    [products, loading, error, ids, pending, add, remove, toggle, clear, load]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside a <WishlistProvider>");
  }
  return context;
}

export default WishlistContext;
