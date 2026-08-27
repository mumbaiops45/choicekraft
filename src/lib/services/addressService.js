// ---------------------------------------------------------------------------
// Address service — address.routes.js, mounted under /users/addresses on the
// server (not at /addresses). Every route is behind `protect`.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  formatAddress,
  formatAddresses,
  toAddressPayload,
} from "@/lib/formatters/address";

const authed = (token, options = {}) => ({
  cache: "no-store",
  credentials: "include",
  token,
  ...options,
});

/** Default first, then newest — the backend's own ordering. */
export async function getAddresses(token, options = {}) {
  if (!token) return [];
  const response = await api.get(
    ENDPOINTS.addresses.list,
    authed(token, options)
  );
  return formatAddresses(response?.data?.addresses);
}

export async function getAddressById(token, id, options = {}) {
  const response = await api.get(
    ENDPOINTS.addresses.byId(id),
    authed(token, options)
  );
  return formatAddress(response?.data?.address);
}

/** The first address a customer saves is made default automatically. */
export async function createAddress(token, form, options = {}) {
  const response = await api.post(
    ENDPOINTS.addresses.create,
    toAddressPayload(form),
    authed(token, options)
  );
  return formatAddress(response?.data?.address);
}

export async function updateAddress(token, id, form, options = {}) {
  const response = await api.put(
    ENDPOINTS.addresses.update(id),
    toAddressPayload(form),
    authed(token, options)
  );
  return formatAddress(response?.data?.address);
}

export async function setDefaultAddress(token, id, options = {}) {
  const response = await api.patch(
    ENDPOINTS.addresses.setDefault(id),
    undefined,
    authed(token, options)
  );
  return formatAddress(response?.data?.address);
}

/** Deleting the default promotes another address server-side. */
export async function deleteAddress(token, id, options = {}) {
  const response = await api.delete(
    ENDPOINTS.addresses.remove(id),
    authed(token, options)
  );
  return { success: true, message: response?.message || "Address deleted" };
}

export const addressService = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};

export default addressService;
