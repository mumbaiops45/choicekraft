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
import useRevalidateOnFocus from "../hooks/useRevalidateOnFocus";

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

/**
 * What tells two lines apart in the cart. Almost always just the slug — one
 * product, one line. A product with variants ("144 Pages" vs "176 Pages") can
 * have several lines at once, so its variant id joins the key. Plain string,
 * not an object, so it works as-is wherever a slug used to: as a `key` prop,
 * and as the argument to setQty/remove.
 */
const keyFor = (slug, variantId) => (variantId ? `${slug}::${variantId}` : slug);

/** Server cart item -> the flat shape the drawer renders. */
const fromServer = (item) => ({
  itemId: item.id,
  key: keyFor(item.product.slug, item.variant?.id),
  id: item.product.id,
  slug: item.product.slug,
  name: item.product.name,
  type: item.product.type || "",
  price: item.price,
  mrp: item.product.mrp ?? null,
  image: item.product.image,
  kind: item.product.kind || "stationery",
  qty: item.quantity,
  variantId: item.variant?.id || null,
  variantName: item.variant?.name || null,
});

/**
 * Product (+ its chosen variant, if any) -> a guest cart line. `variant` is
 * one entry from the product's own `variants` list — its price and name
 * override the base product's, the way the server does for a signed-in cart.
 */
const toLocal = (product, qty, variant = null) => ({
  id: product.id || "",
  key: keyFor(product.slug, variant?.id),
  slug: product.slug,
  name: product.name,
  type: product.type || "",
  price: variant?.price ?? product.price,
  mrp: variant ? variant.mrp : (product.mrp ?? null),
  image: product.image,
  kind: product.kind || "stationery",
  qty,
  variantId: variant?.id || null,
  variantName: variant?.name || null,
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

  // Coming back to this tab re-reads the server cart, so a change made
  // elsewhere (another tab, another device, an item going out of stock)
  // shows up here without a manual reload. Skipped while a mutation of our
  // own is in flight, so it can't clobber that request's own refresh.
  useRevalidateOnFocus(loadServerCart, isAuthenticated && !busy);

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
              ...(item.variantId ? { variantId: item.variantId } : {}),
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
    (key) => items.find((item) => item.key === key),
    [items]
  );

  // Server cart calls currently running. Quick taps on + each start one.
  const inFlight = useRef(0);

  /** Runs a server cart call, surfaces its message, and reloads the cart. */
  const run = useCallback(
    async (action) => {
      const token = getToken();
      if (!token) return { ok: false };

      inFlight.current += 1;
      setBusy(true);
      setError("");

      let outcome;
      try {
        await authedCall((t) => action(t));
        outcome = { ok: true };
      } catch (err) {
        // "Only 3 units available" and friends come from the backend.
        const message = err?.message || "Something went wrong.";
        setError(message);
        outcome = { ok: false, message };
      }

      inFlight.current -= 1;

      // Re-read only once the last call has finished. Reading after each of
      // several quick taps would put a half-updated count back on screen
      // between them. (A failed call is re-read by whoever made it.)
      if (outcome.ok && inFlight.current === 0) await loadServerCart();
      if (inFlight.current === 0) setBusy(false);

      return outcome;
    },
    [getToken, authedCall, loadServerCart]
  );

  const add = useCallback(
    async (product, qty = 1, { openCart = true, variant = null } = {}) => {
      const key = keyFor(product.slug, variant?.id);

      // A product (or, for one with variants, a specific option of it) goes
      // into the cart once, and how many is changed with the - / + stepper.
      // Letting every tap on "Add to cart" quietly bump the quantity meant
      // the same line got added again and again. Say so instead — in the
      // cart drawer, next to the line and its stepper.
      if (items.some((item) => item.key === key)) {
        const label = variant ? `${product.name} — ${variant.name}` : product.name;
        const message = `${label} is already in your cart. Change the quantity below.`;
        setError(message);
        if (openCart) setOpen(true);
        return { ok: false, alreadyInCart: true, message };
      }

      // Nothing left over from an earlier refusal (guests never go through
      // `run`, which is what clears it for signed-in shoppers).
      setError("");

      // The wishlist adds in place and shows a stepper, so it opts out of
      // having the cart drawer slide over the top of it.
      if (openCart) setOpen(true);

      if (!isAuthenticated) {
        setLocalItems((current) => {
          const found = current.find((i) => i.key === key);
          if (found) {
            return current.map((i) =>
              i.key === key ? { ...i, qty: i.qty + qty } : i
            );
          }
          return [...current, toLocal(product, qty, variant)];
        });
        return { ok: true };
      }

      // Show the line now rather than once the server has answered. Adding and
      // then re-reading the cart are two round trips, and until both finish the
      // drawer would sit on "Your cart is empty". The re-read that follows
      // swaps this for the server's copy, with the real item id.
      setServerItems((current) => {
        const found = current.find((i) => i.key === key);
        if (found) {
          return current.map((i) =>
            i.key === key ? { ...i, qty: i.qty + qty } : i
          );
        }
        return [
          ...current,
          { ...toLocal(product, qty, variant), itemId: "", pending: true },
        ];
      });

      const result = await run((token) =>
        cartService.addToCart(token, {
          productId: product.id,
          ...(variant?.id ? { variantId: variant.id } : {}),
          quantity: qty,
        })
      );

      // The server refused it (out of stock, ...): re-read so the line shown
      // above goes away. `run` has already put the reason in `error`.
      if (!result.ok) await loadServerCart();

      return result;
    },
    [items, isAuthenticated, run, loadServerCart]
  );

  const setQty = useCallback(
    async (key, qty) => {
      if (!isAuthenticated) {
        setLocalItems((current) =>
          qty <= 0
            ? current.filter((i) => i.key !== key)
            : current.map((i) => (i.key === key ? { ...i, qty } : i))
        );
        return { ok: true };
      }

      const item = findItem(key);
      // A line just added is on screen before the server has given it an id.
      if (!item?.itemId) return { ok: false };

      // Change the number on screen first, as add() does, so the stepper
      // answers a tap straight away instead of after two round trips.
      setServerItems((current) =>
        qty <= 0
          ? current.filter((i) => i.key !== key)
          : current.map((i) => (i.key === key ? { ...i, qty } : i))
      );

      // The backend has no "quantity 0" — that is a removal.
      const result = await run((token) =>
        qty <= 0
          ? cartService.removeCartItem(token, item.itemId)
          : cartService.updateCartItem(token, item.itemId, qty)
      );

      // Refused (e.g. more than is in stock): put the server's number back.
      if (!result.ok) await loadServerCart();

      return result;
    },
    [isAuthenticated, findItem, run, loadServerCart]
  );

  // Removing a line is setting its quantity to nothing.
  const remove = useCallback((key) => setQty(key, 0), [setQty]);

  const clear = useCallback(async () => {
    if (!isAuthenticated) {
      setLocalItems([]);
      return { ok: true };
    }
    return run((token) => cartService.clearCart(token));
  }, [isAuthenticated, run]);

  /** Re-reads the server basket, for when a page finds it out of step. */
  const refresh = useCallback(async () => {
    if (isAuthenticated) await loadServerCart();
  }, [isAuthenticated, loadServerCart]);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const saved = items.reduce(
      (sum, i) => sum + (i.mrp ? (i.mrp - i.price) * i.qty : 0),
      0
    );
    return {
      items,
      /** Units in the basket: 1 product at quantity 2 is 2. Checkout keys off
          this, so changing a quantity re-prices the order. */
      count,
      /** Different products in the basket: 1 product at quantity 2 is 1. This
          is the number to show people — the cart title and navbar badge. */
      productCount: items.length,
      subtotal,
      saved,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      refresh,
      busy,
      error,
      clearError: () => setError(""),
      /** True while the basket is the server one. */
      isServerCart: isAuthenticated,
    };
  }, [
    items,
    open,
    add,
    setQty,
    remove,
    clear,
    refresh,
    busy,
    error,
    isAuthenticated,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
