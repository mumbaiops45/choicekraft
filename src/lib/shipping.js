// ---------------------------------------------------------------------------
// Delivery charges.
//
// These MIRROR the backend's utils/orderStock.js — calculateTotals() there is
// what actually prices an order, and the checkout preview, the COD route and
// the Razorpay route all go through it. Nothing here is ever charged.
//
// They exist because the cart drawer has to say "add ₹X more for free
// delivery" before checkout, and /api/checkout is behind auth, so a guest
// basket cannot ask the server what it would cost.
//
// If the backend's thresholds change, change them here too. They were out of
// step once already: the drawer promised free delivery over ₹1,999 while the
// server was giving it at ₹500, so customers who already qualified were told
// to spend ₹1,400 more.
// ---------------------------------------------------------------------------

/** Free delivery from this cart value up. */
export const FREE_SHIPPING_THRESHOLD = 500;

/** Flat charge below the threshold. */
export const SHIPPING_FLAT = 50;

/** What the backend will charge for a basket of this size. */
export const shippingFor = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

/** How much more is needed to reach free delivery — 0 once it is reached. */
export const amountToFreeShipping = (subtotal) =>
  Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
