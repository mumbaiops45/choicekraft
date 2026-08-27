// ---------------------------------------------------------------------------
// Checkout preview — checkout.routes.js.
//
// A POST that only reads: it re-prices the cart against live stock and returns
// totals for the chosen address. Nothing is written, and the amount is
// recalculated again at payment time, so a stale preview can never decide what
// gets charged.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatCheckout } from "@/lib/formatters/order";

/**
 * @param {string} token     access token
 * @param {string} addressId the delivery address to price against
 * @returns {Promise<{items: object[], address: object|null, subtotal: number,
 *                    shippingFee: number, total: number}|null>}
 */
export async function previewCheckout(token, addressId, options = {}) {
  const response = await api.post(
    ENDPOINTS.checkout.preview,
    { addressId },
    { cache: "no-store", credentials: "include", token, ...options }
  );
  return formatCheckout(response?.data?.checkout);
}

export const checkoutService = { previewCheckout };
export default checkoutService;
