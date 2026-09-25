"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatINR } from "@/lib/formatters/currency";
import { useCart } from "../context/CartContext";
import { useAuth } from "../store/AuthStore";
import { useWishlist } from "../store/WishlistStore";

export default function ProductCard({ product }) {
  const { add, items } = useCart();
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();

  const saved = wishlist.has(product.id);
  const inCart = items.some((item) => item.slug === product.slug);
  const off = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const isBook = product.kind === "book";

  return (
    <article className="group flex h-full flex-col border border-line bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.13)]">
      {/* The card is one big link to its product page; the heart and add-to-
          cart buttons stop the click from bubbling up into that navigation. */}
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        {/* One fixed ratio for every card so rows line up, whatever the source
            image shape. object-contain means nothing is ever cropped. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
          <img
            src={product.image}
            alt={"ChoiceKraft " + product.name}
            loading="lazy"
            className={
              "h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06] " +
              (isBook ? "p-2" : "p-5")
            }
          />

          {/* Wishlist heart. Only for signed-in shoppers — there is nowhere to
              save a product to otherwise, and anonymous visitors keep the card
              exactly as it was. */}
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                wishlist.toggle(product);
              }}
              disabled={wishlist.isPending(product.id)}
              aria-label={
                (saved ? "Remove " : "Save ") + product.name + " to wishlist"
              }
              aria-pressed={saved}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors hover:text-primary disabled:opacity-50"
            >
              <Heart
                size={16}
                strokeWidth={2}
                className={saved ? "fill-primary text-primary" : ""}
              />
            </button>
          )}

          {/* Badges stack down the left — book covers carry the printed
              ChoiceKraft logo in their top-right corner. Stock badges lead
              the stack: they're the most consequential thing on the card. */}
          <div className="pointer-events-none absolute left-0 top-4 flex flex-col items-start gap-2">
            {!product.hasVariants && !product.inStock && (
              <span className="bg-danger px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-white">
                Sold Out
              </span>
            )}
            {product.lowStock && (
              <span className="bg-warning px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-white">
                Low Stock
              </span>
            )}
            {product.badge && (
              <span className="bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-primary-foreground">
                {product.badge}
              </span>
            )}
            {off > 0 && (
              <span className="bg-secondary px-3 py-1.5 text-[10px] font-bold tracking-[1px] text-secondary-foreground">
                {off}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="min-h-[16px] text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {product.type}
          </p>

          {/* Fixed two-line slot keeps titles from pushing prices out of line */}
          <h3 className="mt-1.5 line-clamp-2 min-h-[48px] text-[16px] font-bold leading-6 tracking-[0.3px] text-ink transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[17px] font-bold text-primary">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-[13px] text-muted line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>

          {product.lowStock && (
            <p className="mt-1 text-[12px] font-semibold text-warning">
              Only {product.stock} left in stock
            </p>
          )}

          {/* mt-auto pins every button to the bottom, so buttons line up across
              a row no matter how long the names above them are. */}
          <div className="mt-auto pt-5">
            {product.hasVariants ? (
              // Which option to add isn't known from the card, so this is
              // not its own button — it rides the card's own link to the
              // product page, where a variant can actually be picked.
              <span
                aria-hidden="true"
                className="block w-full bg-secondary py-3 text-center text-[12px] font-semibold tracking-[2px] text-secondary-foreground transition-colors group-hover:bg-primary"
              >
                SELECT OPTIONS
              </span>
            ) : !product.inStock ? (
              <span
                aria-hidden="true"
                className="block w-full cursor-not-allowed bg-line py-3 text-center text-[12px] font-semibold tracking-[2px] text-muted"
              >
                SOLD OUT
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  add(product);
                }}
                className="w-full bg-secondary py-3 text-[12px] font-semibold tracking-[2px] text-secondary-foreground transition-colors hover:bg-primary">
                {inCart ? "ADDED TO CART" : "ADD TO CART"}
              </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
