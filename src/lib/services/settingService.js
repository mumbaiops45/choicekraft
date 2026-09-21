// ---------------------------------------------------------------------------
// Setting service — store-wide values the admin edits from the Settings page.
//
// Shipping fee/threshold and the free-gift threshold/product are all public:
// the storefront needs them before checkout even loads (cart drawer, product
// page, FAQ copy), and none of it is sensitive.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

/** Used only when the backend is unreachable — keeps copy sane, never charged. */
const FALLBACK_SHIPPING = { shippingCharge: 50, freeShippingThreshold: 1000 };

/** Same idea for the gift: no product means nothing is ever shown as free. */
const FALLBACK_GIFT = { freeGiftThreshold: 500, freeGiftProduct: null };

/**
 * Live shipping settings from the admin-editable Setting singleton.
 * @returns {Promise<{ shippingCharge: number, freeShippingThreshold: number }>}
 */
export async function getShippingSettings(options = {}) {
  const response = await api.get(ENDPOINTS.settings.shipping, {
    cache: "no-store",
    ...options,
  });
  const data = response?.data || {};
  return {
    shippingCharge: Number(data.shippingCharge) || 0,
    freeShippingThreshold: Number(data.freeShippingThreshold) || 0,
  };
}

/**
 * Same as getShippingSettings, but a dead/erroring backend yields the last
 * known real defaults instead of throwing — the root layout renders with
 * these before anything else on the page needs them.
 * @returns {Promise<{ shippingCharge: number, freeShippingThreshold: number }>}
 */
export async function getShippingSettingsSafe(options = {}) {
  try {
    return await getShippingSettings(options);
  } catch (error) {
    console.error("[settingService] getShippingSettings failed:", error.message);
    return FALLBACK_SHIPPING;
  }
}

/**
 * The one free-gift product, if the admin has configured one, plus the
 * subtotal that unlocks it. No product configured means no gift is ever
 * attached, even past the threshold — the caller decides what that means
 * for copy ("free gift" vs nothing shown at all).
 * @returns {Promise<{ freeGiftThreshold: number, freeGiftProduct: {id: string, name: string, image: string}|null }>}
 */
export async function getGiftSettings(options = {}) {
  const response = await api.get(ENDPOINTS.settings.gift, {
    cache: "no-store",
    ...options,
  });
  const data = response?.data || {};
  const product = data.freeGiftProduct;
  return {
    freeGiftThreshold: Number(data.freeGiftThreshold) || 0,
    freeGiftProduct: product
      ? {
          id: product.id || product._id || "",
          name: product.name || "",
          image: product.image || "",
        }
      : null,
  };
}

/** Same fallback pattern as getShippingSettingsSafe. */
export async function getGiftSettingsSafe(options = {}) {
  try {
    return await getGiftSettings(options);
  } catch (error) {
    console.error("[settingService] getGiftSettings failed:", error.message);
    return FALLBACK_GIFT;
  }
}

export const settingService = {
  getShippingSettings,
  getShippingSettingsSafe,
  getGiftSettings,
  getGiftSettingsSafe,
};

export default settingService;
