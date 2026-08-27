"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Lock,
  LocateFixed,
  CreditCard,
  Banknote,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../store/AuthStore";
import { useCart } from "../context/CartContext";
import { formatINR } from "@/lib/formatters/currency";
import * as addressService from "@/lib/services/addressService";
import { previewCheckout } from "@/lib/services/checkoutService";
import { locateAddress } from "@/lib/services/geocodeService";
import { placeCodOrder } from "@/lib/services/orderService";
import {
  createPaymentOrder,
  loadRazorpay,
  verifyPayment,
} from "@/lib/services/paymentService";

const EMPTY_FORM = {
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "home",
  isDefault: false,
};

/**
 * Checkout.
 *
 * Address -> priced preview -> Razorpay -> verified order.
 *
 * The totals shown here come from the backend's /checkout preview, and the
 * amount actually charged is recalculated server-side again when the payment
 * order is created. Nothing about the price is decided in this file.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, restoring, getToken, authedCall, openAccount } =
    useAuth();
  const cart = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState("online");
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [error, setError] = useState("");

  const setField = (key) => (e) =>
    setForm((current) => ({
      ...current,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // ----------------------------------------------------------------
  // Addresses
  // ----------------------------------------------------------------

  const loadAddresses = useCallback(
    async (preferId) => {
      const token = getToken();
      if (!token) return;

      try {
        const list = await authedCall((t) => addressService.getAddresses(t));
        setAddresses(list);
        // Backend sorts default first, so [0] is the sensible pick.
        setSelectedId(
          preferId || list.find((a) => a.isDefault)?.id || list[0]?.id || ""
        );
        setShowForm(list.length === 0);
      } catch (err) {
        setError(err?.message || "Could not load your addresses.");
      } finally {
        setLoading(false);
      }
    },
    [getToken, authedCall]
  );

  useEffect(() => {
    if (restoring) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadAddresses();
  }, [restoring, isAuthenticated, loadAddresses]);

  // ----------------------------------------------------------------
  // Priced preview for the chosen address
  // ----------------------------------------------------------------

  useEffect(() => {
    if (!selectedId || !isAuthenticated) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await authedCall((t) => previewCheckout(t, selectedId));
        if (!cancelled) {
          setPreview(result);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          // "Your cart is empty", "X has only N units available", etc.
          setError(err?.message || "Could not price your order.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, isAuthenticated, authedCall, cart.count]);

  /**
   * Fills the form from the device's location. Everything it writes stays a
   * normal editable field — a rooftop fix still gets the flat number wrong,
   * so the customer always gets the last word.
   */
  const useMyLocation = async () => {
    if (locating) return;

    setLocating(true);
    setError("");
    try {
      const found = await locateAddress();
      setForm((current) => ({
        ...current,
        // Only fill what the lookup actually returned; never blank out
        // something the customer already typed.
        ...Object.fromEntries(
          Object.entries(found).filter(([, value]) => value)
        ),
      }));
      setLocated(true);
    } catch (err) {
      setError(err?.message || "Could not get your location.");
    } finally {
      setLocating(false);
    }
  };

  // If the backend says the chosen method is unavailable, fall back to one
  // that is, so PAY NOW can never submit something that will be refused.
  useEffect(() => {
    const methods = preview?.paymentMethods;
    if (!methods) return;

    const chosen = methods.find((option) => option.id === method);
    if (chosen && chosen.available !== false) return;

    const usable = methods.find((option) => option.available !== false);
    if (usable) setMethod(usable.id);
  }, [preview, method]);

  const saveAddress = async (e) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    try {
      const created = await authedCall((t) =>
        addressService.createAddress(t, form)
      );
      setForm(EMPTY_FORM);
      setLocated(false);
      setShowForm(false);
      await loadAddresses(created?.id);
    } catch (err) {
      setError(err?.message || "Could not save the address.");
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = async (id) => {
    setBusy(true);
    try {
      await authedCall((t) => addressService.setDefaultAddress(t, id));
      await loadAddresses(id);
    } catch (err) {
      setError(err?.message || "Could not set the default address.");
    } finally {
      setBusy(false);
    }
  };

  const removeAddress = async (id) => {
    setBusy(true);
    try {
      await authedCall((t) => addressService.deleteAddress(t, id));
      await loadAddresses(id === selectedId ? "" : selectedId);
    } catch (err) {
      setError(err?.message || "Could not delete the address.");
    } finally {
      setBusy(false);
    }
  };

  // ----------------------------------------------------------------
  // Pay
  // ----------------------------------------------------------------

  /** Cash on delivery: no payment gateway, the order is placed directly. */
  const placeCod = async () => {
    setPaying(true);
    setError("");
    try {
      const { order } = await authedCall((t) => placeCodOrder(t, selectedId));
      await cart.clear();
      router.push(order?.id ? `/orders/${order.id}` : "/orders");
    } catch (err) {
      setError(
        err?.status === 404
          ? "Cash on delivery is not available yet. Please pay online."
          : err?.message || "Could not place your order."
      );
      setPaying(false);
    }
  };

  const pay = async () => {
    if (paying || !selectedId) return;

    if (method === "cod") return placeCod();

    setPaying(true);
    setError("");

    try {
      const order = await authedCall((t) =>
        createPaymentOrder(t, selectedId)
      );

      const ready = await loadRazorpay();
      if (!ready) {
        throw new Error(
          "Could not load the payment window. Check your connection and try again."
        );
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "ChoiceKraft",
        description: "Order payment",
        order_id: order.razorpayOrderId,
        prefill: {
          name: preview?.address?.name || "",
          contact: preview?.address?.phone || "",
        },
        theme: { color: "#e91e78" },
        handler: async (response) => {
          try {
            const { order: placed } = await authedCall((t) =>
              verifyPayment(t, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
            );
            // The backend empties the cart as part of verification.
            await cart.clear();
            router.push(placed?.id ? `/orders/${placed.id}` : "/orders");
          } catch (err) {
            setError(
              err?.message ||
                "Payment went through but the order could not be confirmed. Please contact us."
            );
            setPaying(false);
          }
        },
        modal: {
          // Closing the widget is not a failure — just let them try again.
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.on("payment.failed", (response) => {
        setError(response?.error?.description || "The payment failed.");
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err?.message || "Could not start the payment.");
      setPaying(false);
    }
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  const METHOD_UI = {
    online: {
      Icon: CreditCard,
      label: "Pay online",
      hint: "UPI, cards, netbanking, wallets and EMI",
    },
    cod: {
      Icon: Banknote,
      label: "Cash on delivery",
      hint: "Pay the courier when your order arrives",
    },
  };

  // The backend decides whether COD is on and under what cap, and sends the
  // list when it knows. Older deployments do not, so both are offered and a
  // refusal surfaces as an error instead.
  const paymentOptions = (
    preview?.paymentMethods || [
      { id: "online", available: true },
      { id: "cod", available: true },
    ]
  )
    .filter((option) => METHOD_UI[option.id])
    .map((option) => ({
      id: option.id,
      ...METHOD_UI[option.id],
      label: option.label || METHOD_UI[option.id].label,
      available: option.available,
      reason: option.unavailableReason || "",
    }));

  const field =
    "w-full border border-line px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary";

  if (restoring || loading) {
    return (
      <>
        <PageHeader title="Checkout" crumb="CHECKOUT" />
        <p className="mx-auto max-w-[1510px] px-6 py-24 text-center text-muted">
          Loading…
        </p>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader title="Checkout" crumb="CHECKOUT" />
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <Lock size={30} strokeWidth={1.4} className="text-primary" />
          </span>
          <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
            Please sign in to check out
          </h2>
          <p className="mt-3 leading-8 text-muted">
            Your basket is saved — signing in moves it across with you, nothing
            is lost.
          </p>

          <button
            onClick={openAccount}
            className="mt-8 bg-primary px-10 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            SIGN IN TO CONTINUE
          </button>

          <Link
            href="/products"
            className="mt-4 border-2 border-secondary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </>
    );
  }

  if (cart.count === 0 && !preview) {
    return (
      <>
        <PageHeader title="Checkout" crumb="CHECKOUT" />
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <ShoppingBag size={30} strokeWidth={1.4} className="text-muted" />
          </span>
          <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
            Your cart is empty
          </h2>
          <Link
            href="/products"
            className="mt-8 bg-primary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            START SHOPPING
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Checkout" crumb="CHECKOUT" />

      <div className="mx-auto max-w-[1510px] px-6 py-14">
        {error && (
          <div
            role="status"
            className="mb-8 flex items-start gap-3 border-l-[3px] border-primary bg-surface p-4"
          >
            <AlertCircle
              size={17}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-primary"
            />
            <p className="text-[13px] leading-6 text-ink-soft">{error}</p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* -------------------- Addresses -------------------- */}
          <section>
            <h2 className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
              <MapPin size={18} strokeWidth={2} className="text-primary" />
              Delivery address
            </h2>
            <span className="mt-3 block h-[2px] w-9 bg-primary" />

            {addresses.length > 0 && (
              <ul className="mt-6 space-y-3">
                {addresses.map((address) => {
                  const active = address.id === selectedId;
                  return (
                    <li key={address.id}>
                      <div
                        className={
                          "flex gap-4 border p-5 transition-colors " +
                          (active
                            ? "border-primary bg-surface"
                            : "border-line bg-white")
                        }
                      >
                        <button
                          onClick={() => setSelectedId(address.id)}
                          aria-label={"Deliver to " + address.name}
                          aria-pressed={active}
                          className={
                            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors " +
                            (active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-line-strong text-transparent")
                          }
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold text-ink">
                            {address.name}
                            <span className="ml-2 text-[11px] font-semibold uppercase tracking-[1px] text-muted">
                              {address.addressType}
                            </span>
                            {address.isDefault && (
                              <span className="ml-2 bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-secondary-foreground">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-[13px] leading-6 text-muted">
                            {address.oneLine}
                          </p>
                          <p className="mt-0.5 text-[13px] text-muted">
                            {address.phone}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
                            {!address.isDefault && (
                              <button
                                onClick={() => makeDefault(address.id)}
                                disabled={busy}
                                className="font-semibold text-primary hover:underline disabled:opacity-50"
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              onClick={() => removeAddress(address.id)}
                              disabled={busy}
                              className="flex items-center gap-1.5 text-muted transition-colors hover:text-primary disabled:opacity-50"
                            >
                              <Trash2 size={13} strokeWidth={1.8} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 flex items-center gap-2 border-2 border-secondary px-6 py-3 text-[12px] font-semibold tracking-[1.5px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Plus size={15} strokeWidth={2.2} />
                ADD A NEW ADDRESS
              </button>
            ) : (
              <form
                onSubmit={saveAddress}
                className="mt-6 border border-line bg-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[14px] font-bold uppercase tracking-[1px] text-ink">
                    New address
                  </p>

                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="flex items-center gap-2 border border-line px-4 py-2.5 text-[11px] font-semibold tracking-[1px] text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    <LocateFixed size={14} strokeWidth={2} />
                    {locating ? "FINDING…" : "USE MY LOCATION"}
                  </button>
                </div>

                {located && (
                  <p className="mt-3 text-[12px] leading-5 text-muted">
                    Filled from your location — check every line and correct
                    anything before saving. Flat and building numbers are rarely
                    right.
                  </p>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="Full name"
                    aria-label="Full name"
                    className={field}
                  />
                  <input
                    required
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="Phone number"
                    aria-label="Phone number"
                    className={field}
                  />
                  <input
                    required
                    value={form.addressLine1}
                    onChange={setField("addressLine1")}
                    placeholder="Flat, house no., building"
                    aria-label="Address line 1"
                    className={field + " sm:col-span-2"}
                  />
                  <input
                    value={form.addressLine2}
                    onChange={setField("addressLine2")}
                    placeholder="Area, street (optional)"
                    aria-label="Address line 2"
                    className={field + " sm:col-span-2"}
                  />
                  <input
                    required
                    value={form.city}
                    onChange={setField("city")}
                    placeholder="City"
                    aria-label="City"
                    className={field}
                  />
                  <input
                    required
                    value={form.state}
                    onChange={setField("state")}
                    placeholder="State"
                    aria-label="State"
                    className={field}
                  />
                  <input
                    required
                    value={form.postalCode}
                    onChange={setField("postalCode")}
                    placeholder="PIN code"
                    aria-label="PIN code"
                    className={field}
                  />
                  <input
                    required
                    value={form.country}
                    onChange={setField("country")}
                    placeholder="Country"
                    aria-label="Country"
                    className={field}
                  />
                  <select
                    value={form.addressType}
                    onChange={setField("addressType")}
                    aria-label="Address type"
                    className={field}
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={setField("isDefault")}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    Make this my default address
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="bg-primary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                  >
                    {busy ? "SAVING…" : "SAVE ADDRESS"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="border border-line px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* -------------------- Summary -------------------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-white p-6">
              <h2 className="text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
                Order summary
              </h2>
              <span className="mt-3 block h-[2px] w-9 bg-primary" />

              {!preview ? (
                <p className="mt-6 text-[13px] leading-6 text-muted">
                  {addresses.length === 0
                    ? "Add a delivery address to see your total."
                    : "Pricing your order…"}
                </p>
              ) : (
                <>
                  <ul className="mt-6 space-y-3 border-b border-line pb-5">
                    {preview.items.map((item) => (
                      <li
                        key={item.productId + (item.variantId || "")}
                        className="flex justify-between gap-4 text-[13px]"
                      >
                        <span className="min-w-0 flex-1 text-ink-soft">
                          {item.name}
                          {item.variantName ? ` — ${item.variantName}` : ""}
                          <span className="text-muted"> × {item.quantity}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-ink">
                          {formatINR(item.itemTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-5 space-y-2.5 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="font-semibold text-ink">
                        {formatINR(preview.subtotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Delivery</dt>
                      <dd className="font-semibold text-ink">
                        {preview.shippingFee === 0
                          ? "Free"
                          : formatINR(preview.shippingFee)}
                      </dd>
                    </div>
                  </dl>

                  <fieldset className="mt-6 border-t border-line pt-5">
                    <legend className="text-[13px] font-bold uppercase tracking-[1px] text-ink">
                      Payment method
                    </legend>

                    <div className="mt-4 space-y-2.5">
                      {paymentOptions.map(
                        ({ id, Icon, label, hint, available, reason }) => {
                        const active = method === id;
                        return (
                          <label
                            key={id}
                            className={
                              "flex items-start gap-3 border p-3.5 transition-colors " +
                              (!available
                                ? "cursor-not-allowed border-line opacity-60"
                                : active
                                  ? "cursor-pointer border-primary bg-surface"
                                  : "cursor-pointer border-line hover:border-line-strong")
                            }
                          >
                            <input
                              type="radio"
                              name="payment-method"
                              value={id}
                              checked={active}
                              disabled={!available}
                              onChange={() => {
                                setMethod(id);
                                setError("");
                              }}
                              className="mt-1 h-4 w-4 accent-[var(--primary)]"
                            />
                            <Icon
                              size={17}
                              strokeWidth={1.8}
                              className={
                                "mt-0.5 shrink-0 " +
                                (active ? "text-primary" : "text-muted")
                              }
                            />
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold text-ink">
                                {label}
                              </span>
                              <span className="block text-[12px] leading-5 text-muted">
                                {available ? hint : reason || hint}
                              </span>
                            </span>
                          </label>
                        );
                      }
                      )}
                    </div>
                  </fieldset>

                  <p className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
                    <span className="text-[14px] font-semibold uppercase tracking-[1px] text-ink">
                      Total
                    </span>
                    <span className="text-[22px] font-bold text-ink">
                      {formatINR(preview.total)}
                    </span>
                  </p>

                  <button
                    onClick={pay}
                    disabled={paying || busy || !selectedId}
                    className="mt-6 w-full bg-primary py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                  >
                    {paying
                      ? method === "cod"
                        ? "PLACING ORDER…"
                        : "OPENING PAYMENT…"
                      : method === "cod"
                        ? "PLACE ORDER"
                        : "PAY NOW"}
                  </button>

                  {method === "online" && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted">
                      <Lock size={12} strokeWidth={2} />
                      Secured by Razorpay
                    </p>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
