"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, UserCircle, Mail, Lock, User, Info } from "lucide-react";

/**
 * Sign in / register UI.
 *
 * There is no auth backend yet, so this deliberately does NOT pretend to log
 * anyone in — it validates the form and then tells the truth about where
 * accounts stand. Wire the submit handler to a real endpoint when one exists.
 */
export default function AccountPanel({ open, onClose }) {
  const [mode, setMode] = useState("signin");
  const [submitted, setSubmitted] = useState(false);

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
    if (!open) setSubmitted(false);
  }, [open]);

  const field =
    "w-full border border-line py-3 pl-11 pr-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary";

  return (
    <div
      className={"fixed inset-0 z-[70] " + (open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        aria-label="Close account panel"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={
          "absolute inset-0 bg-ink/60 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      <aside
        role="dialog"
        aria-label="Account"
        className={
          "absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
            <UserCircle size={18} strokeWidth={2} className="text-primary" />
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close account panel"
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 border border-line">
            {["signin", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setSubmitted(false);
                }}
                tabIndex={open ? 0 : -1}
                className={
                  "py-3 text-[12px] font-semibold tracking-[1.5px] transition-colors " +
                  (mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-ink-soft hover:text-primary")
                }
              >
                {m === "signin" ? "SIGN IN" : "REGISTER"}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-6 space-y-4"
          >
            {mode === "register" && (
              <div className="relative">
                <User
                  size={17}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  aria-label="Full name"
                  tabIndex={open ? 0 : -1}
                  className={field}
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                tabIndex={open ? 0 : -1}
                className={field}
              />
            </div>

            <div className="relative">
              <Lock
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Password"
                aria-label="Password"
                tabIndex={open ? 0 : -1}
                className={field}
              />
            </div>

            {mode === "signin" && (
              <div className="flex items-center justify-between text-[13px]">
                <label className="flex cursor-pointer items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    tabIndex={open ? 0 : -1}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              tabIndex={open ? 0 : -1}
              className="w-full bg-primary py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {submitted && (
            <div
              role="status"
              className="mt-5 flex gap-3 border-l-[3px] border-primary bg-surface p-4"
            >
              <Info size={17} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[13px] leading-6 text-ink-soft">
                Customer accounts are not connected yet, so there is nothing to
                sign in to. You can still order without an account — or{" "}
                <Link
                  href="/products/contact"
                  onClick={onClose}
                  className="font-semibold text-primary hover:underline"
                >
                  contact us
                </Link>{" "}
                and we will help directly.
              </p>
            </div>
          )}

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
              Buying for a school or office?
            </p>
            <p className="mt-2 leading-7 text-muted">
              Institutional accounts get tiered pricing and GST invoicing.
            </p>
            <Link
              href="/products/contact"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="mt-4 inline-block border-2 border-secondary px-7 py-3 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              REQUEST AN ACCOUNT
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
