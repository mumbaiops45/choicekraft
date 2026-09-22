"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import PageHeader from "../../components/PageHeader";

/**
 * This product specifically failed to load — almost always the same backend
 * fetch blip the root error.js handles, but named for what actually broke
 * (the product, not "the page") and pointed at the shop instead of home,
 * since that is where someone bouncing off a dead product link should go.
 */
export default function Error({ error, retry }) {
  return (
    <>
      <PageHeader title="Product" crumb="PRODUCT" />
      <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
          <AlertTriangle size={30} strokeWidth={1.4} className="text-primary" />
        </span>
        <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
          We couldn&rsquo;t load this product
        </h2>
        <p className="mt-3 leading-8 text-muted">
          This is usually the connection to our server, not that the product
          is unavailable. Please try again in a moment.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => retry()}
            className="bg-primary px-10 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            TRY AGAIN
          </button>
          <Link
            href="/products"
            className="border-2 border-secondary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-8 text-[11px] text-muted">Reference: {error.digest}</p>
        )}
      </div>
    </>
  );
}
