"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, Lock } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../store/AuthStore";
import { getMyOrders } from "@/lib/services/orderService";
import { formatINR } from "@/lib/formatters/currency";

/** Colour the status chip by how far along the order is. */
const statusTone = (status) => {
  if (status === "delivered") return "bg-secondary text-secondary-foreground";
  if (status === "cancelled") return "bg-line text-ink-soft";
  return "bg-primary text-primary-foreground";
};

const asDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export default function OrdersPage() {
  const { isAuthenticated, restoring, authedCall, openAccount } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (restoring) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const list = await authedCall((t) => getMyOrders(t));
        if (!cancelled) setOrders(list);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load your orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restoring, isAuthenticated, authedCall]);

  if (restoring || loading) {
    return (
      <>
        <PageHeader title="My Orders" crumb="ORDERS" />
        <p className="mx-auto max-w-[1510px] px-6 py-24 text-center text-muted">
          Loading…
        </p>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader title="My Orders" crumb="ORDERS" />
        <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <Lock size={30} strokeWidth={1.4} className="text-primary" />
          </span>
          <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
            Please sign in
          </h2>
          <p className="mt-3 leading-8 text-muted">
            Sign in to see your orders and track their delivery.
          </p>
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

  return (
    <>
      <PageHeader title="My Orders" crumb="ORDERS" />

      <div className="mx-auto max-w-[1000px] px-6 py-14">
        {error && (
          <p className="mb-8 border-l-[3px] border-primary bg-surface p-4 text-[13px] leading-6 text-ink-soft">
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center border border-line bg-surface px-6 py-20 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <Package size={32} strokeWidth={1.4} className="text-primary" />
            </span>
            <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
              No orders yet
            </h2>
            <p className="mt-3 max-w-[420px] leading-8 text-muted">
              When you place an order it will appear here with its status and
              delivery details.
            </p>
            <Link
              href="/products"
              className="mt-8 bg-primary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="group flex flex-wrap items-center gap-4 border border-line bg-white p-5 transition-all hover:border-primary hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-3">
                      <span className="text-[15px] font-bold text-ink">
                        {order.orderNumber}
                      </span>
                      <span
                        className={
                          "px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1px] " +
                          statusTone(order.orderStatus)
                        }
                      >
                        {order.orderStatusLabel}
                      </span>
                    </p>
                    <p className="mt-1.5 text-[13px] text-muted">
                      {asDate(order.createdAt)} · {order.totalItems} item
                      {order.totalItems === 1 ? "" : "s"} ·{" "}
                      {order.paymentMethodLabel} · {order.paymentStatusLabel}
                    </p>
                  </div>

                  <p className="text-[18px] font-bold text-ink">
                    {formatINR(order.total)}
                  </p>

                  <ChevronRight
                    size={18}
                    strokeWidth={2}
                    className="text-line-strong transition-colors group-hover:text-primary"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
