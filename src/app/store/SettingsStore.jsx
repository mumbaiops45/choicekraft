"use client";

import { createContext, useContext, useMemo } from "react";
import useShippingSettings from "../hooks/useShippingSettings";
import useGiftSettings from "../hooks/useGiftSettings";

/**
 * Client-side settings store — live shipping and free-gift numbers, read
 * from the same admin-editable Setting singleton the backend prices
 * checkout from.
 *
 * The root layout fetches them on the server and hands them in as
 * `initialShipping` / `initialGift`, so the cart drawer, product page and
 * FAQ copy all read the same numbers instead of each hardcoding their own
 * guess. That drift happened before: this store exists so it cannot happen
 * silently again.
 */
const SettingsContext = createContext(null);

export function SettingsProvider({ initialShipping = null, initialGift = null, children }) {
  const {
    shipping,
    loading: shippingLoading,
    error: shippingError,
    refetch: refetchShipping,
  } = useShippingSettings({ initialData: initialShipping });

  const {
    gift,
    loading: giftLoading,
    error: giftError,
    refetch: refetchGift,
  } = useGiftSettings({ initialData: initialGift });

  const value = useMemo(
    () => ({
      shippingCharge: shipping.shippingCharge,
      freeShippingThreshold: shipping.freeShippingThreshold,

      /** What the backend will charge for a basket of this size. */
      shippingFor: (subtotal) =>
        subtotal >= shipping.freeShippingThreshold ? 0 : shipping.shippingCharge,

      /** How much more is needed to reach free delivery — 0 once reached. */
      amountToFreeShipping: (subtotal) =>
        Math.max(shipping.freeShippingThreshold - subtotal, 0),

      freeGiftThreshold: gift.freeGiftThreshold,
      freeGiftProduct: gift.freeGiftProduct,

      /**
       * Whether a basket this size actually gets a gift attached — past the
       * threshold is not enough on its own if admin has not picked a gift
       * product yet, same rule the backend enforces at checkout.
       */
      giftEligibleFor: (subtotal) =>
        Boolean(gift.freeGiftProduct) && subtotal >= gift.freeGiftThreshold,

      /** How much more is needed to unlock the gift — 0 once reached. */
      amountToFreeGift: (subtotal) =>
        Math.max(gift.freeGiftThreshold - subtotal, 0),

      loading: shippingLoading || giftLoading,
      error: shippingError || giftError,
      refetch: () => {
        refetchShipping();
        refetchGift();
      },
    }),
    [shipping, gift, shippingLoading, giftLoading, shippingError, giftError, refetchShipping, refetchGift],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettingsStore() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsStore must be used inside a <SettingsProvider>");
  }
  return context;
}

export default SettingsContext;
