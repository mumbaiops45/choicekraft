"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { formatINR } from "@/lib/formatters/currency";
import { useCart } from "../context/CartContext";
import { useAuth } from "../store/AuthStore";
import { useWishlist } from "../store/WishlistStore";
import { useSettingsStore } from "../store/SettingsStore";
import Reveal from "./Reveal";

/**
 * Buy Now has no separate checkout path of its own — it adds this product to
 * the same cart Add to Cart uses, then sends the shopper straight to
 * /checkout instead of leaving them to find the cart drawer themselves.
 * Whatever else is already in the cart goes along with it, same as any
 * other e-commerce "buy now" that isn't a fully isolated express lane.
 */
export default function ProductDetail({ product }) {
  const router = useRouter();
  const { add, items } = useCart();
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();
  const { freeShippingThreshold } = useSettingsStore();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const saved = wishlist.has(product.id);
  const inCart = items.some((item) => item.slug === product.slug);
  const off = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const isBook = product.kind === "book";
  const busy = adding || buying;

  const clampQty = (n) => Math.max(1, Math.min(product.stock || 1, n));

  const handleAddToCart = async () => {
    if (busy) return;
    setAdding(true);
    await add(product, qty);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (busy || !product.inStock) return;
    setBuying(true);
    // Already in the cart (from an earlier tap): the cart is refusing a second
    // add, and there is nothing to add anyway — just go and pay for it.
    if (!inCart) await add(product, qty);
    router.push("/checkout");
  };

  return (
    <section className="mx-auto max-w-[1510px] px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden border border-line bg-white">
            {product.image ? (
              <img
                src={product.image}
                alt={"ChoiceKraft " + product.name}
                className={
                  "h-full w-full object-contain " + (isBook ? "p-4" : "p-10")
                }
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[13px] text-muted">
                No image yet
              </span>
            )}

            {off > 0 && (
              <span className="absolute left-4 top-4 bg-secondary px-3 py-1.5 text-[11px] font-bold tracking-[1px] text-secondary-foreground">
                {off}% OFF
              </span>
            )}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-muted">
            {product.categoryName || product.type}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-ink lg:text-[32px]">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="text-[13px] font-semibold text-success">
                  {off}% off
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 max-w-[520px] leading-7 text-ink-soft">
              {product.description}
            </p>
          )}

          <p className="mt-4 text-[13px] font-semibold">
            {product.inStock ? (
              <span className="text-success">
                In stock
                {product.stock <= 5 ? ` — only ${product.stock} left` : ""}
              </span>
            ) : (
              <span className="text-danger">Out of stock</span>
            )}
          </p>

          {product.inStock && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-ink-soft">
                Qty
              </span>
              <div className="flex items-center border border-line">
                <button
                  onClick={() => setQty((q) => clampQty(q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-primary disabled:opacity-30"
                >
                  <Minus size={15} strokeWidth={2} />
                </button>
                <span className="flex h-11 w-12 items-center justify-center text-[14px] font-semibold text-ink">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => clampQty(q + 1))}
                  disabled={qty >= product.stock}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-primary disabled:opacity-30"
                >
                  <Plus size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || busy}
              className="flex flex-1 items-center justify-center gap-2 border-2 border-secondary py-4 text-[12px] font-semibold uppercase tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              {adding ? "ADDING…" : inCart ? "ADDED TO CART" : "ADD TO CART"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock || busy}
              className="flex flex-1 items-center justify-center gap-2 bg-primary py-4 text-[12px] font-semibold uppercase tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap size={16} strokeWidth={2} fill="currentColor" />
              {buying ? "REDIRECTING…" : "BUY NOW"}
            </button>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => wishlist.toggle(product)}
              disabled={wishlist.isPending(product.id)}
              aria-pressed={saved}
              className="mt-4 flex items-center gap-2 text-[13px] font-medium text-ink-soft transition-colors hover:text-primary disabled:opacity-50"
            >
              <Heart
                size={16}
                strokeWidth={2}
                className={saved ? "fill-primary text-primary" : ""}
              />
              {saved ? "Saved to wishlist" : "Add to wishlist"}
            </button>
          )}

          <div className="mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
            <p className="flex items-center gap-2.5 text-[13px] text-ink-soft">
              <Truck size={16} strokeWidth={1.8} className="shrink-0 text-primary" />
              Free shipping above ₹{freeShippingThreshold}
            </p>
            <p className="flex items-center gap-2.5 text-[13px] text-ink-soft">
              <RotateCcw size={16} strokeWidth={1.8} className="shrink-0 text-primary" />
              Easy 7-day returns
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
