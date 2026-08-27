// ---------------------------------------------------------------------------
// Server cart service — every route in cart.routes.js.
//
// NOTE: the storefront's cart is still the local one in context/CartContext,
// which works signed-out and survives with no account. This service binds the
// server-side cart so it is ready to switch to (or merge into) without
// touching the existing cart UI.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatProduct } from "@/lib/formatters/product";

const authed = (token, options = {}) => ({
  cache: "no-store",
  credentials: "include",
  token,
  ...options,
});

/** The backend already totals the cart; this only flattens the products. */
const formatCart = (raw) => {
  const items = Array.isArray(raw?.items) ? raw.items : [];

  return {
    id: raw?.id || "",
    items: items
      .map((item) => {
        const product = formatProduct(item?.product);
        if (!product) return null;
        return {
          id: item._id || item.id,
          product,
          variant: item.variant || null,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          itemTotal: Number(item.itemTotal) || 0,
        };
      })
      .filter(Boolean),
    totalItems: Number(raw?.totalItems) || 0,
    subtotal: Number(raw?.subtotal) || 0,
  };
};

export async function getCart(token, options = {}) {
  const response = await api.get(ENDPOINTS.cart.get, authed(token, options));
  return formatCart(response?.data?.cart);
}

/**
 * @param {{productId: string, variantId?: string, quantity?: number}} payload
 */
export async function addToCart(token, payload, options = {}) {
  const response = await api.post(
    ENDPOINTS.cart.add,
    {
      productId: payload?.productId,
      ...(payload?.variantId ? { variantId: payload.variantId } : {}),
      quantity: Number(payload?.quantity) || 1,
    },
    authed(token, options)
  );
  return { success: true, message: response?.message || "" };
}

export async function updateCartItem(token, itemId, quantity, options = {}) {
  const response = await api.patch(
    ENDPOINTS.cart.updateItem(itemId),
    { quantity: Number(quantity) },
    authed(token, options)
  );
  return { success: true, message: response?.message || "" };
}

export async function removeCartItem(token, itemId, options = {}) {
  const response = await api.delete(
    ENDPOINTS.cart.removeItem(itemId),
    authed(token, options)
  );
  return { success: true, message: response?.message || "" };
}

export async function clearCart(token, options = {}) {
  const response = await api.delete(ENDPOINTS.cart.clear, authed(token, options));
  return { success: true, message: response?.message || "" };
}

export const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

export default cartService;
