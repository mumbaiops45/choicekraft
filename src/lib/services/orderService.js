// ---------------------------------------------------------------------------
// Orders — order.routes.js. Both routes return the customer's own orders only;
// the backend scopes every query by req.user.userId.
// ---------------------------------------------------------------------------

import { api, ApiError } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatOrder, formatOrders } from "@/lib/formatters/order";

const authed = (token, options = {}) => ({
  cache: "no-store",
  credentials: "include",
  token,
  ...options,
});

/** Newest first. */
export async function getMyOrders(token, options = {}) {
  if (!token) return [];
  const response = await api.get(ENDPOINTS.orders.list, authed(token, options));
  return formatOrders(response?.data?.orders);
}

/** Returns null for an order that is missing or belongs to someone else. */
export async function getMyOrder(token, id, options = {}) {
  if (!token || !id) return null;

  try {
    const response = await api.get(
      ENDPOINTS.orders.byId(id),
      authed(token, options)
    );
    return formatOrder(response?.data?.order);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Places a cash-on-delivery order.
 *
 *   POST /orders  body: { addressId }  ->  201 { data: { order } }
 *
 * The backend validates the cart, deducts stock in a transaction, creates the
 * order with paymentStatus "pending", and empties the cart. It answers 409
 * when COD is switched off or the order is over the value cap.
 *
 * @returns {Promise<{order: object|null, message: string}>}
 */
export async function placeCodOrder(token, addressId, options = {}) {
  const response = await api.post(
    ENDPOINTS.orders.cod,
    { addressId },
    authed(token, options)
  );
  return {
    order: formatOrder(response?.data?.order),
    message: response?.message || "",
  };
}

/**
 * Cancels an order and returns its stock to inventory.
 *
 * Only allowed before dispatch — the backend answers 409 for anything already
 * shipped, which is a support matter rather than a self-service one.
 *
 * @returns {Promise<{order: object|null, message: string}>}
 */
export async function cancelOrder(token, id, reason, options = {}) {
  const response = await api.patch(
    ENDPOINTS.orders.cancel(id),
    { reason: (reason || "").trim() || undefined },
    authed(token, options)
  );
  return {
    order: formatOrder(response?.data?.order),
    message: response?.message || "Order cancelled",
  };
}

export const orderService = {
  getMyOrders,
  getMyOrder,
  placeCodOrder,
  cancelOrder,
};
export default orderService;
