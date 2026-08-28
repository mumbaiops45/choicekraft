// ---------------------------------------------------------------------------
// Order and checkout formatters
// ---------------------------------------------------------------------------

import { formatAddress } from "./address";

const ORDER_STATUS_LABELS = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS_LABELS = {
  pending: "Pay on delivery",
  captured: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const PAYMENT_METHOD_LABELS = {
  online: "Paid online",
  cod: "Cash on delivery",
};

/** The backend only lets a customer cancel before dispatch. */
const CUSTOMER_CANCELLABLE = ["confirmed", "processing"];

/** Order lines snapshot the product, so nothing is looked up again. */
const formatOrderItem = (raw) => ({
  id: raw?._id || raw?.id || "",
  productId: raw?.product || "",
  name: raw?.productName || "",
  image: raw?.productImage || "",
  variantId: raw?.variant || null,
  variantName: raw?.variantName || null,
  quantity: Number(raw?.quantity) || 0,
  price: Number(raw?.price) || 0,
  itemTotal: Number(raw?.itemTotal) || 0,
});

export function formatOrder(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw._id || raw.id || "";
  if (!id) return null;

  const shipping = raw.shippingAddress || {};

  return {
    id,
    orderNumber: raw.orderNumber || "",
    items: Array.isArray(raw.items) ? raw.items.map(formatOrderItem) : [],
    // The order stores a copy of the address, not a reference, so it survives
    // the customer editing or deleting the original.
    shippingAddress: {
      ...shipping,
      oneLine: [
        shipping.addressLine1,
        shipping.addressLine2,
        shipping.city,
        `${shipping.state || ""} ${shipping.postalCode || ""}`.trim(),
        shipping.country,
      ]
        .map((part) => (part || "").trim())
        .filter(Boolean)
        .join(", "),
    },
    subtotal: Number(raw.subtotal) || 0,
    shipping: Number(raw.shipping) || 0,
    total: Number(raw.total) || 0,
    orderStatus: raw.orderStatus || "confirmed",
    orderStatusLabel:
      ORDER_STATUS_LABELS[raw.orderStatus] || raw.orderStatus || "",
    paymentStatus: raw.paymentStatus || "",
    paymentStatusLabel:
      PAYMENT_STATUS_LABELS[raw.paymentStatus] || raw.paymentStatus || "",
    paymentMethod: raw.paymentMethod || "online",
    paymentMethodLabel:
      PAYMENT_METHOD_LABELS[raw.paymentMethod] ||
      PAYMENT_METHOD_LABELS.online,
    paidAt: raw.paidAt || null,
    cancelReason: raw.cancelReason || "",
    cancelReasonCode: raw.cancelReasonCode || "",
    cancelledBy: raw.cancelledBy || "",
    canCancel: CUSTOMER_CANCELLABLE.includes(raw.orderStatus),
    razorpayOrderId: raw.razorpayOrderId || "",
    razorpayPaymentId: raw.razorpayPaymentId || "",
    totalItems: Array.isArray(raw.items)
      ? raw.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
      : 0,
    createdAt: raw.createdAt || null,
    deliveredAt: raw.deliveredAt || null,
    cancelledAt: raw.cancelledAt || null,
  };
}

export function formatOrders(list) {
  if (!Array.isArray(list)) return [];
  return list.map(formatOrder).filter(Boolean);
}

/**
 * The cancellation dropdown, as GET /orders/cancel-reasons sends it.
 *
 * The backend rejects any code outside this list, so the list is never
 * hardcoded here — an empty array means the reasons could not be loaded and
 * the cancel form should say so rather than offer choices that will 400.
 */
export function formatCancelReasons(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((raw) => ({
      code: raw?.code || "",
      label: raw?.label || "",
    }))
    .filter((reason) => reason.code && reason.label);
}

/** The /checkout preview: priced lines, the chosen address, and totals. */
export function formatCheckout(raw) {
  if (!raw) return null;

  return {
    items: Array.isArray(raw.items)
      ? raw.items.map((item) => ({
          productId: item.product,
          name: item.productName,
          variantId: item.variant || null,
          variantName: item.variantName || null,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          itemTotal: Number(item.itemTotal) || 0,
        }))
      : [],
    address: formatAddress(raw.address) || null,
    // Newer backends decide COD availability themselves and send the options
    // to render. Older ones do not, so the checkout screen falls back to its
    // own list.
    paymentMethods: Array.isArray(raw.paymentMethods)
      ? raw.paymentMethods.map((method) => ({
          id: method.id,
          label: method.label || "",
          available: method.available !== false,
          unavailableReason: method.unavailableReason || "",
        }))
      : null,
    subtotal: Number(raw.pricing?.subtotal) || 0,
    shippingFee: Number(raw.pricing?.shipping) || 0,
    total: Number(raw.pricing?.total) || 0,
  };
}
