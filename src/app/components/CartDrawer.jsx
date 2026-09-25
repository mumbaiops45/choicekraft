"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../store/AuthStore";
import { useSettingsStore } from "../store/SettingsStore";
import { formatINR } from "@/lib/formatters/currency";
import useScrollLock from "../hooks/useScrollLock";

export default function CartDrawer() {
  const {
    items,
    productCount,
    subtotal,
    saved,
    open,
    setOpen,
    setQty,
    remove,
    clear,
    error,
    clearError,
  } = useCart();
  const { isAuthenticated, restoring, openAccount, closeAccount } = useAuth();
  const { amountToFreeShipping, giftEligibleFor, amountToFreeGift, freeGiftProduct } =
    useSettingsStore();
  const router = useRouter();

  // Checking out needs an account: every route it touches (/checkout,
  // /orders, /payment) is behind auth on the server, so a guest who follows
  // the link only lands on a sign-in wall. Ask here instead, and carry them
  // on to checkout once they are in.
  //
  // While the session is still being restored we let the link through rather
  // than risk asking someone who is already signed in to sign in again.
  const needsSignIn = !restoring && !isAuthenticated;

  const goToCheckout = (event) => {
    setOpen(false);
    if (!needsSignIn) return; // the Link navigates as usual

    event.preventDefault();
    openAccount(() => {
      closeAccount();
      router.push("/checkout");
    });
  };

  const toFreeShipping = amountToFreeShipping(subtotal);
  const giftUnlocked = giftEligibleFor(subtotal);
  const toFreeGift = amountToFreeGift(subtotal);

  useScrollLock(open);

  // Close on Escape while the drawer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div
      className={
        "fixed inset-0 z-[70] " + (open ? "" : "pointer-events-none")
      }
      aria-hidden={!open}
    >
      {/* Scrim */}
      <button
        aria-label="Close cart"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={
          "absolute inset-0 bg-ink/60 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={
          "absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
            <ShoppingBag size={18} strokeWidth={2} className="text-primary" />
            Your Cart
            <span className="text-muted">({productCount})</span>
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        {/* Stock limits and other server cart refusals ("Only 3 units
            available") surface here rather than failing silently. */}
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
              onClick={clearError}
              aria-label="Dismiss message"
              className="shrink-0 text-muted transition-colors hover:text-primary"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
              <ShoppingBag size={30} strokeWidth={1.4} className="text-muted" />
            </span>
            <p className="mt-6 text-[16px] font-semibold text-ink">
              Your cart is empty
            </p>
            <p className="mt-2 leading-7 text-muted">
              Add something from the range and it will show up here.
            </p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="mt-7 bg-primary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <div className="h-[92px] w-[74px] shrink-0 overflow-hidden bg-surface">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={
                        "h-full w-full " +
                        (item.kind === "book"
                          ? "object-cover"
                          : "object-contain p-1.5")
                      }
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    {item.type && (
                      <p className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
                        {item.type}
                      </p>
                    )}
                    <p className="mt-0.5 text-[14px] font-semibold leading-5 text-ink">
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p className="mt-0.5 text-[12px] text-muted">
                        {item.variantName}
                      </p>
                    )}
                    <p className="mt-1 text-[14px] font-bold text-primary">
                      {formatINR(item.price)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button
                          onClick={() => setQty(item.key, item.qty - 1)}
                          disabled={item.pending}
                          aria-label={"Decrease quantity of " + item.name}
                          tabIndex={open ? 0 : -1}
                          className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface disabled:opacity-50"
                        >
                          <Minus size={14} strokeWidth={2.2} />
                        </button>
                        <span className="w-9 text-center text-[14px] font-semibold tabular-nums text-ink">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.key, item.qty + 1)}
                          disabled={item.pending}
                          aria-label={"Increase quantity of " + item.name}
                          tabIndex={open ? 0 : -1}
                          className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface disabled:opacity-50"
                        >
                          <Plus size={14} strokeWidth={2.2} />
                        </button>
                      </div>

                      <button
                        onClick={() => remove(item.key)}
                        disabled={item.pending}
                        aria-label={"Remove " + item.name}
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
              {saved > 0 && (
                <p className="flex justify-between text-[13px] text-muted">
                  You save
                  <span className="font-semibold text-primary">
                    {formatINR(saved)}
                  </span>
                </p>
              )}

              <p className="mt-2 flex items-baseline justify-between">
                <span className="text-[14px] font-semibold uppercase tracking-[1px] text-ink">
                  Subtotal
                </span>
                <span className="text-[20px] font-bold text-ink">
                  {formatINR(subtotal)}
                </span>
              </p>

              <p className="mt-1.5 text-[12px] leading-5 text-muted">
                {toFreeShipping === 0
                  ? "Your order qualifies for free delivery."
                  : "Add " +
                    formatINR(toFreeShipping) +
                    " more for free delivery."}
              </p>

              {/* Only shown when a gift is actually configured — no vague
                  "unlock a gift" promise with nothing behind it. */}
              {freeGiftProduct && (
                <p className="mt-1 text-[12px] leading-5 text-muted">
                  {giftUnlocked
                    ? `You've unlocked a free gift: ${freeGiftProduct.name}!`
                    : "Add " +
                      formatINR(toFreeGift) +
                      " more for a free gift."}
                </p>
              )}

              <Link
                href="/checkout"
                onClick={goToCheckout}
                tabIndex={open ? 0 : -1}
                className="mt-5 flex w-full items-center justify-center gap-2 bg-primary py-4 text-center text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {needsSignIn && <Lock size={14} strokeWidth={2} />}
                {needsSignIn ? "SIGN IN TO CHECK OUT" : "CHECKOUT"}
              </Link>

              {needsSignIn && (
                <p className="mt-2 text-center text-[12px] leading-5 text-muted">
                  Your basket is saved — it moves to your account when you sign
                  in.
                </p>
              )}

              <Link
                href="/products"
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="mt-3 block w-full border-2 border-secondary py-3.5 text-center text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                CONTINUE SHOPPING
              </Link>

              <button
                onClick={async () => {
                  const result = await clear();
                  if (!result.ok) return;
                  // Confirms it actually worked — otherwise an empty drawer
                  // after a click that silently failed reads as "did nothing".
                  clearError();
                }}
                tabIndex={open ? 0 : -1}
                className="mt-3 w-full border border-line py-3.5 text-[12px] font-semibold tracking-[2px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                CLEAR CART
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
