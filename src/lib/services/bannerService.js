// ---------------------------------------------------------------------------
// Banner service — the only place that knows how the banner API is shaped.
//
// One function per backend route (see routes/banner.routes.js).
//
// Everything returns already-formatted data; callers never touch `_id` or
// `image.url`.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatBanner, formatBanners, formatPagination } from "@/lib/formatters/banner";

// ======================================================
// PUBLIC
// ======================================================

/**
 * Active banners for a placement, ordered by `position`.
 *
 * Always live — a banner the admin just activated (or reordered) must show up
 * on the next reload, not a stale cache of the previous set.
 *
 * @param {"homepage"|"offer"} type
 * @returns {Promise<object[]>}
 */
export async function getBanners(type, options = {}) {
  const response = await api.get(ENDPOINTS.banners.list, {
    cache: "no-store",
    ...options,
    params: { type, ...options.params },
  });
  return formatBanners(response?.data?.banners);
}

/**
 * Same as getBanners, but a dead/erroring backend yields an empty list
 * instead of throwing — the hero simply renders nothing rather than take the
 * homepage down.
 * @returns {Promise<object[]>}
 */
export async function getBannersSafe(type, options = {}) {
  try {
    return await getBanners(type, options);
  } catch (error) {
    console.error("[bannerService] getBanners failed:", error.message);
    return [];
  }
}

// ======================================================
// ADMIN — every call needs a bearer token
// ======================================================

/**
 * Admin list: search + type + status + sort + pagination.
 * @returns {Promise<{ banners: object[], pagination: object }>}
 */
export async function getAdminBanners(params = {}, options = {}) {
  const {
    search = "",
    type = "all",
    status = "all",
    sort = "position_asc",
    page = 1,
    limit = 10,
  } = params;

  const response = await api.get(ENDPOINTS.banners.adminList, {
    ...options,
    params: { search, type, status, sort, page, limit },
  });

  return {
    banners: formatBanners(response?.data?.banners),
    pagination: formatPagination(response?.data?.pagination),
  };
}

/** @returns {Promise<object|null>} */
export async function getBannerById(id, options = {}) {
  const response = await api.get(ENDPOINTS.banners.byId(id), options);
  return formatBanner(response?.data?.banner);
}

/** @returns {Promise<object|null>} the created banner */
export async function createBanner(payload, options = {}) {
  const response = await api.post(ENDPOINTS.banners.create, payload, options);
  return formatBanner(response?.data?.banner);
}

/** @returns {Promise<object|null>} the updated banner */
export async function updateBanner(id, payload, options = {}) {
  const response = await api.put(ENDPOINTS.banners.update(id), payload, options);
  return formatBanner(response?.data?.banner);
}

/** @returns {Promise<object|null>} the banner with its new status */
export async function updateBannerStatus(id, isActive, options = {}) {
  const response = await api.patch(
    ENDPOINTS.banners.status(id),
    { isActive: Boolean(isActive) },
    options
  );
  return formatBanner(response?.data?.banner);
}

/** @param {{ id: string, position: number }[]} order */
export async function reorderBanners(order, options = {}) {
  const response = await api.patch(
    ENDPOINTS.banners.reorder,
    { order },
    options
  );
  return { success: true, message: response?.message || "Banners reordered" };
}

/** @returns {Promise<{success: boolean, message: string}>} */
export async function deleteBanner(id, options = {}) {
  const response = await api.delete(ENDPOINTS.banners.remove(id), options);
  return { success: true, message: response?.message || "Banner deleted" };
}

export const bannerService = {
  getBanners,
  getBannersSafe,
  getAdminBanners,
  getBannerById,
  createBanner,
  updateBanner,
  updateBannerStatus,
  reorderBanners,
  deleteBanner,
};

export default bannerService;
