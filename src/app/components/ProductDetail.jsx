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
import { sharedAttributeLabel } from "@/lib/formatters/variant";
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
 *
 * A product with variants ("144 Pages" vs "176 Pages", ...) has no price,
 * stock or "in cart" state of its own — those all belong to whichever
 * variant is picked below. The parent page passes `key={product.id}` so
 * navigating from one product to another (client-side, no full reload)
 * starts this over rather than carrying the last product's picked variant
 * and quantity across.
 */
export default function ProductDetail({ product }) {
  const router = useRouter();
  const { add, items } = useCart();
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();
  const { freeShippingThreshold } = useSettingsStore();

  const variants = product.variants || [];
  const variantLabel = sharedAttributeLabel(variants);

  // Nothing picked yet: the price shown below is a range across every
  // option, the way it would sit on a shelf with several prices tagged on
  // one box. Choosing an option is what turns that into a single price.
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const saved = wishlist.has(product.id);

  const hasVariants = product.hasVariants;
  const selectedVariant = hasVariants
    ? variants.find((v) => v.id === selectedVariantId) || null
    : null;
  // A variant product with no active variants yet (admin turned the switch on
  // before adding any option) has nothing sellable — treat it as unavailable
  // rather than let a variant-less add reach the backend and fail there.
  const variantsMissing = hasVariants && variants.length === 0;
  // Waiting on a choice: priced, but not yet down to one price.
  const needsSelection = hasVariants && !variantsMissing && !selectedVariant;

  const prices = variants.map((v) => v.price);
  const priceRange =
    prices.length > 0
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : null;

  // Price, stock and "in cart" all come from the picked variant once one is
  // chosen; otherwise from the product itself, exactly as before a product
  // could have variants at all.
  const activePrice = hasVariants ? (selectedVariant?.price ?? 0) : product.price;
  const activeMrp = hasVariants ? (selectedVariant?.mrp ?? null) : product.mrp;
  const activeStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;
  const activeInStock = hasVariants
    ? Boolean(selectedVariant?.inStock)
    : product.inStock;

  const inCart = items.some(
    (item) =>
      item.slug === product.slug &&
      (item.variantId || null) === (selectedVariant?.id || null)
  );
  const off = activeMrp
    ? Math.round(((activeMrp - activePrice) / activeMrp) * 100)
    : 0;
  const isBook = product.kind === "book";
  const busy = adding || buying;

  const clampQty = (n) => Math.max(1, Math.min(activeStock || 1, n));

  const handleAddToCart = async () => {
    if (busy) return;
    setAdding(true);
    await add(product, qty, { variant: selectedVariant });
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (busy || !activeInStock) return;
    setBuying(true);
    // Already in the cart (from an earlier tap): the cart is refusing a second
    // add, and there is nothing to add anyway — just go and pay for it.
    if (!inCart) await add(product, qty, { variant: selectedVariant });
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

          {!variantsMissing && (
            <div className="mt-5 flex items-baseline gap-3">
              {needsSelection && priceRange ? (
                priceRange.min === priceRange.max ? (
                  <span className="text-3xl font-bold text-primary">
                    {formatINR(priceRange.min)}
                  </span>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {formatINR(priceRange.min)}
                    <span className="text-lg font-semibold text-muted">
                      {" "}
                      – {formatINR(priceRange.max)}
                    </span>
                  </span>
                )
              ) : (
                <>
                  <span className="text-3xl font-bold text-primary">
                    {formatINR(activePrice)}
                  </span>
                  {activeMrp > activePrice && (
                    <>
                      <span className="text-lg text-muted line-through">
                        {formatINR(activeMrp)}
                      </span>
                      <span className="text-[13px] font-semibold text-success">
                        {off}% off
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {variantsMissing ? (
            <p className="mt-5 text-[13px] font-semibold text-danger">
              This product is not available right now.
            </p>
          ) : (
            hasVariants && (
              <div className="mt-6">
                {variantLabel && (
                  <p className="text-[12px] font-semibold uppercase tracking-[1px] text-ink-soft">
                    {variantLabel}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {variants.map((variant) => {
                    const active = variant.id === selectedVariantId;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          // A quantity picked for one option may not fit the
                          // next — "5" against an 8-in-stock option leaves
                          // 3, then switching to one with only 2 left should
                          // not silently carry that 5 across.
                          setQty(1);
                        }}
                        disabled={!variant.inStock}
                        aria-pressed={active}
                        title={variant.inStock ? undefined : "Out of stock"}
                        className={
                          "border px-4 py-2.5 text-[13px] font-semibold transition-colors " +
                          (!variant.inStock
                            ? "cursor-not-allowed border-line text-muted opacity-50 line-through"
                            : active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-line text-ink hover:border-primary")
                        }
                      >
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {product.description && (
            <p className="mt-5 max-w-[520px] leading-7 text-ink-soft">
              {product.description}
            </p>
          )}

          <p className="mt-4 text-[13px] font-semibold">
            {variantsMissing || needsSelection ? null : activeInStock ? (
              <span className="text-success">
                In stock
                {activeStock <= 5 ? ` — only ${activeStock} left` : ""}
              </span>
            ) : (
              <span className="text-danger">Out of stock</span>
            )}
          </p>

          {needsSelection && (
            <p className="mt-4 text-[13px] leading-6 text-muted">
              Select {variantLabel ? "a " + variantLabel.toLowerCase() : "an option"} above to see stock and add it to your cart.
            </p>
          )}

          {!needsSelection && activeInStock && (
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
                  disabled={qty >= activeStock}
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
              disabled={!activeInStock || busy || variantsMissing || needsSelection}
              className="flex flex-1 items-center justify-center gap-2 border-2 border-secondary py-4 text-[12px] font-semibold uppercase tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              {adding ? "ADDING…" : inCart ? "ADDED TO CART" : "ADD TO CART"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!activeInStock || busy || variantsMissing || needsSelection}
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
