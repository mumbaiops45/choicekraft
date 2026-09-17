"use client";

import { useEffect, useState } from "react";
import { X, UserCircle } from "lucide-react";
import { useAuth } from "../store/AuthStore";

const SEEN_KEY = "ck-welcome-seen";

/**
 * First-visit sign-in nudge.
 *
 * Shown once, and only to a visitor who is not signed in. Skipping it (or
 * signing in) marks it seen for good on this device — it never asks twice.
 * `restoring` is checked first so a returning signed-in visitor never sees it
 * flash before the session restore finishes.
 */
export default function WelcomeGate() {
  const { isAuthenticated, restoring, openAccount } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (restoring || isAuthenticated) return;

    let seen = true;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false; // private mode / blocked storage — treat as first visit
    }

    setOpen(!seen);
  }, [restoring, isAuthenticated]);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore — worst case it asks again next visit
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ChoiceKraft"
      className="fixed inset-0 z-[75] flex items-center justify-center p-4"
    >
      <button
        aria-label="Skip and browse as guest"
        onClick={dismiss}
        className="absolute inset-0 bg-ink/60"
      />

      <div className="relative w-full max-w-[400px] bg-white p-8 text-center shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Skip and browse as guest"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <UserCircle size={32} strokeWidth={1.7} className="text-primary-foreground" />
        </span>

        <h2 className="mt-6 text-lg font-bold uppercase tracking-[1px] text-ink">
          Welcome to ChoiceKraft
        </h2>
        <p className="mt-3 text-[13px] leading-6 text-muted">
          Sign in for faster checkout, order tracking and your wishlist — or
          skip ahead and explore first.
        </p>

        <button
          onClick={() => {
            dismiss();
            openAccount();
          }}
          className="mt-6 w-full bg-primary py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          SIGN IN
        </button>

        <button
          onClick={dismiss}
          className="mt-3 w-full py-2 text-[12px] font-medium text-muted transition-colors hover:text-primary"
        >
          Skip and browse
        </button>
      </div>
    </div>
  );
}
