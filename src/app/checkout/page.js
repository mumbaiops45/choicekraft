"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Lock,
  CreditCard,
  Gift,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { CheckoutSkeleton } from "../components/skeletons/Skeleton";
import { useAuth } from "../store/AuthStore";
import { useCart } from "../context/CartContext";
import { formatINR } from "@/lib/formatters/currency";
import * as addressService from "@/lib/services/addressService";
import { previewCheckout } from "@/lib/services/checkoutService";
import {
  createPaymentOrder,
  loadRazorpay,
  verifyPayment,
} from "@/lib/services/paymentService";

/**
 * A form control with its name shown above it. Placeholders alone vanish as
 * soon as a field has a value, which leaves an edit form with no field names.
 */
function FormField({ label, optional = false, className = "", children }) {
  return (
    <label className={"block " + className}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-muted">(optional)</span>
        )}
      </span>
      {children}
    </label>
  );
}

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
  const { refresh: refreshCart } = cart;

  // Two real steps, not just a scroll: address first, payment only once
  // an address is confirmed. Keeps the pay button from ever being visible
  // before there is somewhere to ship to.
  const [step, setStep] = useState("address");
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  // Id of the address the form is editing; "" means it is adding a new one.
  const [editingId, setEditingId] = useState("");
  const formRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState("online");
  const [error, setError] = useState("");
  // Set once payment is verified. The backend has emptied the cart by then, so
  // re-pricing it would only earn a "Your cart is empty" on the way out.
  const orderPlaced = useRef(false);

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
    // While the cart is syncing (at sign-in the guest basket is moved up one
    // item at a time) the server only has part of it, or none yet, and pricing
    // it now reads as "Your cart is empty". This re-runs when `busy` clears.
    if (orderPlaced.current || cart.busy) return;

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

          // The server is the source of truth for the basket. If it says the
          // cart is empty while this tab still lists items, the tab is stale
          // (an order went through and its response was lost, another tab
          // emptied it, ...) — resync rather than leave the two disagreeing.
          if (
            cart.count > 0 &&
            err?.status === 400 &&
            /cart is empty/i.test(err?.message || "")
          ) {
            refreshCart();
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    selectedId,
    isAuthenticated,
    authedCall,
    cart.count,
    cart.busy,
    refreshCart,
  ]);

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

  const startNew = () => {
    setEditingId("");
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (address) => {
    setError("");
    setForm({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "India",
      addressType: address.addressType || "home",
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
    setShowForm(false);
  };

  // The form sits below the address list, so bring it into view when an
  // existing address is opened for editing from further up the page.
  useEffect(() => {
    if (editingId) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingId]);

  const saveAddress = async (e) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    try {
      let keepSelected = selectedId;

      if (editingId) {
        // Selection stays where it was; the list is re-read below so the
        // edited details show straight away.
        await authedCall((t) =>
          addressService.updateAddress(t, editingId, form)
        );
      } else {
        const created = await authedCall((t) =>
          addressService.createAddress(t, form)
        );
        keepSelected = created?.id;
      }

      closeForm();
      await loadAddresses(keepSelected);
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
    if (id === editingId) closeForm();
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

  const pay = async () => {
    if (paying || !selectedId) return;

    setPaying(true);
    setError("");

    try {
      const order = await authedCall((t) =>
        createPaymentOrder(t, selectedId)
      );

      // Razorpay's widget cannot start without these two — say so here
      // rather than open it half-configured.
      if (!order.keyId || !order.razorpayOrderId) {
        throw new Error(
          "The payment gateway did not return its details. Please try again."
        );
      }

      const ready = await loadRazorpay();
      if (!ready) {
        throw new Error(
          "Could not load the payment window. Check your connection and try again."
        );
      }

      // From the address list rather than the pricing preview, so a phone
      // number or name edited on this page is what Razorpay pre-fills.
      const chosen = addresses.find((address) => address.id === selectedId);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "ChoiceKraft",
        description: "Order payment",
        order_id: order.razorpayOrderId,
        prefill: {
          name: chosen?.name || preview?.address?.name || "",
          contact: chosen?.phone || preview?.address?.phone || "",
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
            orderPlaced.current = true;
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
  };

  // Cash on delivery is not offered here — only ever show methods this page
  // knows how to render, whatever the backend sends.
  const paymentOptions = (
    preview?.paymentMethods || [{ id: "online", available: true }]
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

  const selectedAddress =
    addresses.find((address) => address.id === selectedId) || null;
  const editingAddress =
    addresses.find((address) => address.id === editingId) || null;

  // Switching steps is a state flip, not a real navigation, so the browser
  // never resets scroll on its own — without this, whoever scrolled down to
  // reach "Continue to payment" lands on the next step already scrolled past
  // its heading.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goToPayment = () => {
    if (!selectedId || !preview) return;
    setError("");
    setStep("payment");
  };

  // `cart.busy` covers the guest basket being merged into the server one right
  // after sign-in, when the cart briefly reads as empty.
  if (restoring || loading || cart.busy) {
    return (
      <>
        <PageHeader title="Checkout" crumb="CHECKOUT" />
        <div role="status">
          <span className="sr-only">Loading…</span>
          <CheckoutSkeleton />
        </div>
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
        <ol className="mb-8 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[1.5px]">
          <li className={step === "address" ? "text-primary" : "text-muted"}>
            1. Address
          </li>
          <span className="text-line" aria-hidden="true">
            —
          </span>
          <li className={step === "payment" ? "text-primary" : "text-muted"}>
            2. Payment
          </li>
        </ol>

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
          {step === "payment" ? (
            <section>
              <h2 className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
                <MapPin size={18} strokeWidth={2} className="text-primary" />
                Delivery address
              </h2>
              <span className="mt-3 block h-[2px] w-9 bg-primary" />

              {selectedAddress && (
                <div className="mt-6 flex gap-4 border border-line bg-white p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-ink">
                      {selectedAddress.name}
                      <span className="ml-2 text-[11px] font-semibold uppercase tracking-[1px] text-muted">
                        {selectedAddress.addressType}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="ml-2 bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-secondary-foreground">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-muted">
                      {selectedAddress.oneLine}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {selectedAddress.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    className="h-fit shrink-0 text-[12px] font-semibold text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </section>
          ) : (
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
                              onClick={() => startEdit(address)}
                              disabled={busy}
                              className="flex items-center gap-1.5 text-muted transition-colors hover:text-primary disabled:opacity-50"
                            >
                              <Pencil size={13} strokeWidth={1.8} />
                              Edit
                            </button>
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
                onClick={startNew}
                className="mt-5 flex items-center gap-2 border-2 border-secondary px-6 py-3 text-[12px] font-semibold tracking-[1.5px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Plus size={15} strokeWidth={2.2} />
                ADD A NEW ADDRESS
              </button>
            ) : (
              <form
                ref={formRef}
                onSubmit={saveAddress}
                className="mt-6 border border-line bg-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[14px] font-bold uppercase tracking-[1px] text-ink">
                    {editingId ? "Edit address" : "New address"}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FormField label="Full name">
                    <input
                      required
                      value={form.name}
                      onChange={setField("name")}
                      className={field}
                    />
                  </FormField>
                  <FormField label="Phone number">
                    <input
                      required
                      value={form.phone}
                      onChange={setField("phone")}
                      className={field}
                    />
                  </FormField>
                  <FormField label="Address line 1" className="sm:col-span-2">
                    <input
                      required
                      value={form.addressLine1}
                      onChange={setField("addressLine1")}
                      placeholder="Flat, house no., building"
                      className={field}
                    />
                  </FormField>
                  <FormField
                    label="Address line 2"
                    optional
                    className="sm:col-span-2"
                  >
                    <input
                      value={form.addressLine2}
                      onChange={setField("addressLine2")}
                      placeholder="Area, street"
                      className={field}
                    />
                  </FormField>
                  <FormField label="City">
                    <input
                      required
                      value={form.city}
                      onChange={setField("city")}
                      className={field}
                    />
                  </FormField>
                  <FormField label="State">
                    <input
                      required
                      value={form.state}
                      onChange={setField("state")}
                      className={field}
                    />
                  </FormField>
                  <FormField label="PIN code">
                    <input
                      required
                      value={form.postalCode}
                      onChange={setField("postalCode")}
                      className={field}
                    />
                  </FormField>
                  <FormField label="Country">
                    <input
                      required
                      value={form.country}
                      onChange={setField("country")}
                      className={field}
                    />
                  </FormField>
                  <FormField label="Address type">
                    <select
                      value={form.addressType}
                      onChange={setField("addressType")}
                      className={field}
                    >
                      <option value="home">Home</option>
                      <option value="office">Office</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>
                  {/* Already the default, so there is nothing to opt into. */}
                  {!editingAddress?.isDefault && (
                    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-soft sm:self-end sm:pb-3.5">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={setField("isDefault")}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      Make this my default address
                    </label>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="bg-primary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                  >
                    {busy
                      ? "SAVING…"
                      : editingId
                        ? "SAVE CHANGES"
                        : "SAVE ADDRESS"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={closeForm}
                      className="border border-line px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            )}
            </section>
          )}

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

                  {/* Only shown once a gift is actually attached — eligible
                      alone is not enough if admin has not picked one. */}
                  {preview.freeGift?.eligible && preview.freeGift?.productName ? (
                    <p className="mt-4 flex items-center gap-2.5 border border-line bg-surface p-3.5 text-[13px] leading-6 text-ink-soft">
                      <Gift
                        size={16}
                        strokeWidth={1.8}
                        className="shrink-0 text-primary"
                      />
                      Free gift with this order:{" "}
                      <span className="font-semibold text-ink">
                        {preview.freeGift.productName}
                      </span>
                    </p>
                  ) : null}

                  {step === "payment" && (
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
                  )}

                  <p className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
                    <span className="text-[14px] font-semibold uppercase tracking-[1px] text-ink">
                      Total
                    </span>
                    <span className="text-[22px] font-bold text-ink">
                      {formatINR(preview.total)}
                    </span>
                  </p>

                  {step === "address" ? (
                    <button
                      type="button"
                      onClick={goToPayment}
                      disabled={!selectedId || !preview || busy}
                      className="mt-6 w-full bg-primary py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={pay}
                        disabled={paying || busy || !selectedId}
                        className="mt-6 w-full bg-primary py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                      >
                        {paying ? "OPENING PAYMENT…" : "PAY NOW"}
                      </button>

                      <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted">
                        <Lock size={12} strokeWidth={2} />
                        Secured by Razorpay
                      </p>
                    </>
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
