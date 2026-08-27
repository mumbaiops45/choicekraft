"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Heart, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { useWishlist } from "../store/WishlistStore";
import { useCart } from "../context/CartContext";
import { formatINR } from "@/lib/formatters/currency";

/**
 * Saved-items drawer, opened from the navbar heart.
 *
 * Mirrors the cart drawer so the two read as a pair. "MOVE" is the whole point
 * of the list: it adds the product to the cart and drops it from here.
 */
export default function WishlistDrawer({ open, onClose }) {
  const wishlist = useWishlist();
  const cart = useCart();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  /**
   * Wishlist -> cart. If the cart refuses it (out of stock), the product stays
   * in the wishlist rather than vanishing from both places.
   */
  const moveToCart = async (product) => {
    setError("");
    const result = await cart.add(product, 1);
    if (result && result.ok === false) {
      setError(result.message || "Could not add that to your cart.");
      return;
    }
    await wishlist.remove(product.id);
    onClose();
  };

  return (
    <div
      className={"fixed inset-0 z-[70] " + (open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <button
        aria-label="Close wishlist"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={
          "absolute inset-0 bg-ink/60 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      <aside
        role="dialog"
        aria-label="Wishlist"
        className={
          "absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
            <Heart size={18} strokeWidth={2} className="text-primary" />
            Wishlist
            <span className="text-muted">({wishlist.count})</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close wishlist"
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        {error && (
          <div
            role="status"
            className="flex items-start gap-3 border-b border-line bg-surface px-6 py-3.5"
          >
            <AlertCircle
              size={16}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-primary"
            />
            <p className="flex-1 text-[13px] leading-6 text-ink-soft">{error}</p>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss message"
              className="shrink-0 text-muted transition-colors hover:text-primary"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        )}

        {wishlist.loading ? (
          <p className="flex-1 px-8 py-16 text-center text-[13px] text-muted">
            Loading your wishlist…
          </p>
        ) : wishlist.products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Heart size={30} strokeWidth={1.4} className="text-muted" />
            </span>
            <p className="mt-6 text-[16px] font-semibold text-ink">
              Your wishlist is empty
            </p>
            <p className="mt-2 leading-7 text-muted">
              Tap the heart on any product and it will show up here.
            </p>
            <Link
              href="/products"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="mt-7 bg-primary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {wishlist.products.map((product) => (
                <li key={product.id} className="flex gap-4 py-5">
                  <div className="h-[92px] w-[74px] shrink-0 overflow-hidden bg-surface">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className={
                        "h-full w-full " +
                        (product.kind === "book"
                          ? "object-cover"
                          : "object-contain p-2")
                      }
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    {product.type && (
                      <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                        {product.type}
                      </p>
                    )}
                    <p className="mt-1 text-[15px] font-bold leading-5 text-ink">
                      {product.name}
                    </p>
                    <p className="mt-1 text-[15px] font-bold text-primary">
                      {formatINR(product.price)}
                      {product.mrp > product.price && (
                        <span className="ml-2 text-[13px] font-normal text-muted line-through">
                          {formatINR(product.mrp)}
                        </span>
                      )}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <button
                        onClick={() => moveToCart(product)}
                        disabled={wishlist.isPending(product.id) || cart.busy}
                        tabIndex={open ? 0 : -1}
                        className="flex items-center gap-2 bg-secondary px-4 py-2.5 text-[11px] font-semibold tracking-[1.5px] text-secondary-foreground transition-colors hover:bg-primary disabled:opacity-50"
                      >
                        <ShoppingBag size={14} strokeWidth={2} />
                        MOVE TO CART
                      </button>

                      <button
                        onClick={() => wishlist.remove(product.id)}
                        disabled={wishlist.isPending(product.id)}
                        aria-label={"Remove " + product.name}
                        tabIndex={open ? 0 : -1}
                        className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-primary disabled:opacity-50"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-5">
              <button
                onClick={async () => {
                  const result = await wishlist.clear();
                  if (!result.ok) setError(result.message || "Could not clear.");
                }}
                tabIndex={open ? 0 : -1}
                className="w-full border border-line py-3.5 text-[12px] font-semibold tracking-[2px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                CLEAR WISHLIST
              </button>

              <Link
                href="/products"
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="mt-3 block w-full border-2 border-secondary py-3.5 text-center text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                CONTINUE SHOPPING
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
