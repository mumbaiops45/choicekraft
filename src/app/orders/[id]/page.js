"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Lock,
  XCircle,
  Banknote,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../store/AuthStore";
import {
  cancelOrder,
  getCancelReasons,
  getMyOrder,
} from "@/lib/services/orderService";
import { formatINR } from "@/lib/formatters/currency";

const STEPS = [
  ["confirmed", "Confirmed"],
  ["processing", "Processing"],
  ["shipped", "Shipped"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
];

const asDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export default function OrderDetailPage({ params }) {
  // params is a promise in this version of Next — unwrap it before reading.
  const { id } = use(params);

  const { isAuthenticated, restoring, authedCall, openAccount } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // The cancellation dropdown. Fetched only when the customer opens the form,
  // since most visits to this page are just checking on a delivery.
  const [reasons, setReasons] = useState([]);
  const [reasonsLoading, setReasonsLoading] = useState(false);
  const [reasonCode, setReasonCode] = useState("");
  const [note, setNote] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (restoring) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const found = await authedCall((t) => getMyOrder(t, id));
        if (!cancelled) setOrder(found);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load this order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restoring, isAuthenticated, authedCall, id]);

  /** Opens the cancel form and pulls the reasons the backend will accept. */
  const startCancel = async () => {
    setConfirming(true);
    setCancelError("");
    if (reasons.length || reasonsLoading) return;

    setReasonsLoading(true);
    try {
      setReasons(await authedCall((t) => getCancelReasons(t)));
    } catch {
      setCancelError(
        "Could not load the cancellation reasons. Please try again."
      );
    } finally {
      setReasonsLoading(false);
    }
  };

  const closeCancel = () => {
    setConfirming(false);
    setCancelError("");
  };

  /**
   * Cancelling returns the stock to inventory, server-side and atomically.
   *
   * The same two rules the backend enforces are checked here first, so an
   * obvious mistake costs a keystroke rather than a round trip.
   */
  const cancel = async () => {
    if (cancelling) return;

    if (!reasonCode) {
      setCancelError("Please choose a reason for cancelling.");
      return;
    }

    if (reasonCode === "other" && note.trim().length < 3) {
      setCancelError(
        "Please tell us a little more about why you are cancelling."
      );
      return;
    }

    setCancelling(true);
    setCancelError("");
    setError("");
    try {
      await authedCall((t) => cancelOrder(t, id, { reasonCode, reason: note }));
      const refreshed = await authedCall((t) => getMyOrder(t, id));
      setOrder(refreshed);
      setConfirming(false);
      setReasonCode("");
      setNote("");
    } catch (err) {
      setCancelError(err?.message || "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  if (restoring || loading) {
    return (
      <>
        <PageHeader title="Order" crumb="ORDER" />
        <p className="mx-auto max-w-[1510px] px-6 py-24 text-center text-muted">
          Loading…
        </p>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader title="Order" crumb="ORDER" />
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <Lock size={30} strokeWidth={1.4} className="text-primary" />
          </span>
          <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
            Please sign in
          </h2>
          <button
            onClick={openAccount}
            className="mt-8 bg-primary px-10 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            SIGN IN
          </button>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <PageHeader title="Order" crumb="ORDER" />
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
          <h2 className="text-xl font-bold uppercase tracking-[0.5px] text-ink">
            Order not found
          </h2>
          <p className="mt-3 leading-8 text-muted">
            {error || "This order does not exist, or it is not yours."}
          </p>
          <Link
            href="/orders"
            className="mt-8 border-2 border-secondary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            BACK TO MY ORDERS
          </Link>
        </div>
      </>
    );
  }

  const cancelled = order.orderStatus === "cancelled";
  const stepIndex = STEPS.findIndex(([key]) => key === order.orderStatus);

  return (
    <>
      <PageHeader title={order.orderNumber} crumb="ORDER" />

      <div className="mx-auto max-w-[1000px] px-6 py-14">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          All orders
        </Link>

        {/* Status */}
        <div className="mt-8 border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[16px] font-bold text-ink">
                <CheckCircle2 size={18} strokeWidth={2} className="text-primary" />
                {order.orderStatusLabel}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                Placed {asDateTime(order.createdAt)} ·{" "}
                {order.paymentMethodLabel} · {order.paymentStatusLabel}
              </p>
              {cancelled && order.cancelReason && (
                <p className="mt-1 text-[13px] text-muted">
                  Reason: {order.cancelReason}
                  {order.cancelledBy === "admin" && " (cancelled by our team)"}
                </p>
              )}
            </div>
            <p className="text-[22px] font-bold text-ink">
              {formatINR(order.total)}
            </p>
          </div>

          {order.paymentMethod === "cod" &&
            order.paymentStatus === "pending" && (
              <p className="mt-4 flex items-start gap-2.5 border border-line bg-surface p-3.5 text-[13px] leading-6 text-ink-soft">
                <Banknote
                  size={16}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-primary"
                />
                Please keep {formatINR(order.total)} ready — the courier
                collects it on delivery.
              </p>
            )}

          {error && (
            <p className="mt-4 border-l-[3px] border-primary bg-surface p-3.5 text-[13px] leading-6 text-ink-soft">
              {error}
            </p>
          )}

          {order.canCancel && (
            <div className="mt-5 border-t border-line pt-5">
              {!confirming ? (
                <button
                  onClick={startCancel}
                  className="flex items-center gap-2 border border-line px-5 py-2.5 text-[12px] font-semibold tracking-[1px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
                >
                  <XCircle size={15} strokeWidth={1.8} />
                  CANCEL ORDER
                </button>
              ) : (
                <div className="max-w-[460px]">
                  <p className="text-[13px] leading-6 text-ink-soft">
                    Cancel this order? The items go back into stock.
                  </p>

                  <label
                    htmlFor="cancel-reason"
                    className="mt-4 block text-[12px] font-semibold uppercase tracking-[1px] text-ink"
                  >
                    Why are you cancelling?
                  </label>
                  <select
                    id="cancel-reason"
                    value={reasonCode}
                    onChange={(e) => {
                      setReasonCode(e.target.value);
                      setCancelError("");
                    }}
                    disabled={cancelling || reasonsLoading || !reasons.length}
                    className="mt-2 w-full border border-line bg-white px-3.5 py-3 text-[14px] text-ink outline-none transition-colors focus:border-primary disabled:opacity-60"
                  >
                    <option value="">
                      {reasonsLoading ? "Loading reasons…" : "Select a reason"}
                    </option>
                    {reasons.map((reason) => (
                      <option key={reason.code} value={reason.code}>
                        {reason.label}
                      </option>
                    ))}
                  </select>

                  {/* "Something else" tells the shop nothing on its own, so
                      the backend insists on a few words with it. */}
                  {reasonCode === "other" && (
                    <textarea
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value);
                        setCancelError("");
                      }}
                      disabled={cancelling}
                      rows={3}
                      maxLength={300}
                      placeholder="Tell us a little more…"
                      className="mt-3 w-full resize-none border border-line bg-white px-3.5 py-3 text-[14px] leading-6 text-ink outline-none transition-colors focus:border-primary disabled:opacity-60"
                    />
                  )}

                  {cancelError && (
                    <p className="mt-3 border-l-[3px] border-primary bg-surface p-3 text-[13px] leading-6 text-ink-soft">
                      {cancelError}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={cancel}
                      disabled={cancelling || !reasons.length}
                      className="bg-primary px-5 py-2.5 text-[12px] font-semibold tracking-[1px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                    >
                      {cancelling ? "CANCELLING…" : "YES, CANCEL"}
                    </button>
                    <button
                      onClick={closeCancel}
                      disabled={cancelling}
                      className="border border-line px-5 py-2.5 text-[12px] font-semibold tracking-[1px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
                    >
                      KEEP IT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!cancelled && (
            <ol className="mt-7 grid gap-3 sm:grid-cols-5">
              {STEPS.map(([key, label], i) => {
                const reached = i <= stepIndex;
                return (
                  <li key={key} className="flex flex-col gap-2">
                    <span
                      className={
                        "h-[3px] w-full " + (reached ? "bg-primary" : "bg-line")
                      }
                    />
                    <span
                      className={
                        "text-[11px] font-semibold uppercase tracking-[0.5px] " +
                        (reached ? "text-ink" : "text-muted")
                      }
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Items */}
          <section className="border border-line bg-white">
            <h2 className="border-b border-line px-6 py-4 text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
              Items
            </h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-5">
                  {item.image && (
                    <div className="h-[80px] w-[64px] shrink-0 overflow-hidden bg-surface">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold leading-5 text-ink">
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p className="mt-1 text-[12px] text-muted">
                        {item.variantName}
                      </p>
                    )}
                    <p className="mt-1.5 text-[13px] text-muted">
                      {formatINR(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[15px] font-bold text-ink">
                    {formatINR(item.itemTotal)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Address + totals */}
          <aside className="space-y-8">
            <div className="border border-line bg-white p-6">
              <h2 className="flex items-center gap-2.5 text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                <MapPin size={16} strokeWidth={2} className="text-primary" />
                Delivering to
              </h2>
              <p className="mt-4 text-[14px] font-semibold text-ink">
                {order.shippingAddress.name}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-muted">
                {order.shippingAddress.oneLine}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {order.shippingAddress.phone}
              </p>
            </div>

            <div className="border border-line bg-white p-6">
              <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                Payment
              </h2>
              <dl className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-semibold text-ink">
                    {formatINR(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="font-semibold text-ink">
                    {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-[14px] font-semibold uppercase tracking-[1px] text-ink">
                  Total
                </span>
                <span className="text-[18px] font-bold text-ink">
                  {formatINR(order.total)}
                </span>
              </p>
              {order.razorpayPaymentId && (
                <p className="mt-4 break-all text-[11px] leading-5 text-muted">
                  Payment ID: {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
