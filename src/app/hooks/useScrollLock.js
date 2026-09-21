"use client";

import { useEffect } from "react";

// Shared across every consumer of this hook, not per-component — see why below.
let lockCount = 0;

/**
 * Locks page scroll while `active` is true.
 *
 * The cart, wishlist, search and account overlays can each trigger one
 * another (e.g. "move to cart" from an open wishlist drawer opens the cart
 * drawer before the wishlist one closes), so their locks can overlap and
 * release out of order. Each one saving whatever `body.style.overflow`
 * happened to be and restoring that later means an inner overlay can save
 * "hidden" as its "previous" value and hand that back on close — leaving
 * scroll permanently locked even though nothing is open anymore.
 *
 * A shared reference count sidesteps that: scroll only unlocks once every
 * overlay that asked for it has let go, regardless of the order they opened
 * or closed in.
 */
export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    document.body.style.overflow = "hidden";

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [active]);
}

export { useScrollLock };
