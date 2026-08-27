// ---------------------------------------------------------------------------
// Razorpay payment — payment.routes.js (mounted at /payment, singular).
//
// Flow:
//   1. createPaymentOrder — the backend prices the cart and opens a Razorpay
//      order, returning its id and the public key.
//   2. Razorpay's checkout widget takes over in the browser.
//   3. verifyPayment — the backend checks the signature, deducts stock inside
//      a transaction, creates the Order and empties the cart.
//
// The browser never decides the amount: the backend recalculates it from the
// cart both times.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatOrder } from "@/lib/formatters/order";

const authed = (token, options = {}) => ({
  cache: "no-store",
  credentials: "include",
  token,
  ...options,
});

/** Razorpay's widget script — loaded once, and only when checkout is reached. */
export const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

/** @returns {Promise<boolean>} whether window.Razorpay is usable */
export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const selector = 'script[src="' + RAZORPAY_SCRIPT + '"]';
    const existing = document.querySelector(selector);

    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens a Razorpay order for the current cart.
 * @returns {Promise<object>} razorpayOrderId, amounts, and the public key id
 */
export async function createPaymentOrder(token, addressId, options = {}) {
  const response = await api.post(
    ENDPOINTS.payment.createOrder,
    { addressId },
    authed(token, options)
  );

  const data = response?.data || {};

  return {
    paymentId: data.payment?.id || "",
    razorpayOrderId:
      data.payment?.razorpayOrderId || data.razorpay?.orderId || "",
    amount: Number(data.payment?.amount) || 0,
    amountInPaise: Number(data.payment?.amountInPaise) || 0,
    currency: data.payment?.currency || "INR",
    keyId: data.razorpay?.keyId || "",
    totals: {
      subtotal: Number(data.checkout?.subtotal) || 0,
      shippingFee: Number(data.checkout?.shipping) || 0,
      total: Number(data.checkout?.total) || 0,
    },
  };
}

/**
 * Hands Razorpay's response back for signature verification. On success the
 * order exists and the cart is empty.
 *
 * @returns {Promise<{order: object|null, message: string}>}
 */
export async function verifyPayment(token, payload, options = {}) {
  const response = await api.post(
    ENDPOINTS.payment.verify,
    {
      razorpayOrderId: payload?.razorpayOrderId,
      razorpayPaymentId: payload?.razorpayPaymentId,
      razorpaySignature: payload?.razorpaySignature,
    },
    authed(token, options)
  );

  return {
    order: formatOrder(response?.data?.order),
    message: response?.message || "",
  };
}

export const paymentService = {
  loadRazorpay,
  createPaymentOrder,
  verifyPayment,
};

export default paymentService;
