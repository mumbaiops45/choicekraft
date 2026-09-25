"use client";

import { useEffect } from "react";

// Shared across every consumer of this hook, not per-component — see why below.
let lockCount = 0;
// Where the page was when the first lock went on, so it can be put back.
let savedScrollY = 0;

/** True while any overlay holds the page lock. */
export function isScrollLocked() {
  return lockCount > 0;
}

function lock() {
  const body = document.body;
  savedScrollY = window.scrollY;

  // The scrollbar disappears with the lock; pad its width back so the page
  // behind the overlay does not shift sideways on mouse devices.
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;

  // `overflow: hidden` alone is ignored by iOS Safari and many Android
  // browsers: typing in a field inside an overlay made them scroll the page
  // underneath to "reveal" the caret, dumping the user at the top of the
  // page. Pinning the body in place, offset by the current scroll, holds it
  // exactly where it was on every device.
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function unlock() {
  const body = document.body;
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  body.style.paddingRight = "";

  // `html { scroll-behavior: smooth }` would otherwise animate the page all
  // the way down from the top instead of simply staying put.
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, savedScrollY);
  html.style.scrollBehavior = previous;
}

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
    if (lockCount === 1) lock();

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) unlock();
    };
  }, [active]);
}

export { useScrollLock };
