// ---------------------------------------------------------------------------
// Wishlist service — every route in wishlist.routes.js.
//
// All of these are behind `protect`, so each one takes the access token the
// auth store holds in memory. The wishlist returns products populated exactly
// like the catalogue does, so the product formatter is reused verbatim.
// ---------------------------------------------------------------------------

import { api, ApiError } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatProducts } from "@/lib/formatters/product";

const authed = (token, options = {}) => ({
  cache: "no-store",
  credentials: "include",
  token,
  ...options,
});

/**
 * @returns {Promise<{products: object[], totalItems: number}>}
 */
export async function getWishlist(token, options = {}) {
  if (!token) return { products: [], totalItems: 0 };

  const response = await api.get(
    ENDPOINTS.wishlist.list,
    authed(token, options)
  );

  const products = formatProducts(response?.data?.wishlist?.products);
  return {
    products,
    // A brand new wishlist comes back without totalItems — count instead.
    totalItems: response?.data?.wishlist?.totalItems ?? products.length,
  };
}

/**
 * Adds a product. A duplicate answers 409, which is treated as success —
 * the product is in the wishlist either way, which is all the caller wants.
 */
export async function addToWishlist(token, productId, options = {}) {
  try {
    const response = await api.post(
      ENDPOINTS.wishlist.add(productId),
      undefined,
      authed(token, options)
    );
    return { success: true, message: response?.message || "" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { success: true, message: "Already in your wishlist" };
    }
    throw error;
  }
}

/** @returns {Promise<boolean>} */
export async function isWishlisted(token, productId, options = {}) {
  if (!token || !productId) return false;
  const response = await api.get(
    ENDPOINTS.wishlist.check(productId),
    authed(token, options)
  );
  return Boolean(response?.data?.isWishlisted);
}

/** Removing something already gone answers 404 — also fine. */
export async function removeFromWishlist(token, productId, options = {}) {
  try {
    const response = await api.delete(
      ENDPOINTS.wishlist.remove(productId),
      authed(token, options)
    );
    return { success: true, message: response?.message || "" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { success: true, message: "Not in your wishlist" };
    }
    throw error;
  }
}

export async function clearWishlist(token, options = {}) {
  const response = await api.delete(
    ENDPOINTS.wishlist.clear,
    authed(token, options)
  );
  return { success: true, message: response?.message || "" };
}

export const wishlistService = {
  getWishlist,
  addToWishlist,
  isWishlisted,
  removeFromWishlist,
  clearWishlist,
};

export default wishlistService;
