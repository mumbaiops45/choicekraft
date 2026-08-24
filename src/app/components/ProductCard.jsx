"use client";

import { formatINR } from "../data/products";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const off = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const isBook = product.kind === "book";

  return (
    <article className="group flex h-full flex-col border border-line bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.13)]">
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

        {/* Badges stack down the left — book covers carry the printed
            ChoiceKraft logo in their top-right corner. */}
        <div className="pointer-events-none absolute left-0 top-4 flex flex-col items-start gap-2">
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

        {/* mt-auto pins every button to the bottom, so buttons line up across
            a row no matter how long the names above them are. */}
        <div className="mt-auto pt-5">
          <button
            onClick={() => add(product)}
            className="w-full bg-secondary py-3 text-[12px] font-semibold tracking-[2px] text-secondary-foreground transition-colors hover:bg-primary">
            ADD TO CART
          </button>
        </div>
      </div>
    </article>
  );
}
