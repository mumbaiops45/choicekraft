// ---------------------------------------------------------------------------
// Category service — the only place that knows how the category API is shaped.
//
// One function per backend route (see routes/category.routes.js). Public reads
// are cached server-side and tagged "categories", so an admin write can drop
// the whole cache with revalidateTag("categories").
//
// Everything returns already-formatted data; callers never touch `_id` or
// `image.url`.
// ---------------------------------------------------------------------------

import { api, ApiError } from "@/lib/api/client";
import { CATEGORY_REVALIDATE } from "@/lib/api/config";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  formatCategories,
  formatCategory,
  formatPagination,
} from "@/lib/formatters/category";

/** Cache tag shared by every public category read. */
export const CATEGORY_CACHE_TAG = "categories";

const cached = (options = {}) =>
  CATEGORY_REVALIDATE > 0
    ? {
        cache: "force-cache",
        revalidate: CATEGORY_REVALIDATE,
        tags: [CATEGORY_CACHE_TAG],
        ...options,
      }
    : // Always live: a stale page must never hide a category the admin just
      // added.
      { cache: "no-store", ...options };

/**
 * Oldest first, keeping the backend's relative order for anything without a
 * createdAt so a missing timestamp can never scramble the list.
 */
const bySequence = (list) =>
  list
    .map((item, index) => ({ item, index, at: Date.parse(item.createdAt) }))
    .sort((a, b) => {
      const aAt = Number.isNaN(a.at) ? null : a.at;
      const bAt = Number.isNaN(b.at) ? null : b.at;
      if (aAt === null || bAt === null) return a.index - b.index;
      return aAt - bAt || a.index - b.index;
    })
    .map((entry) => entry.item);

// ======================================================
// PUBLIC
// ======================================================

/**
 * Every active category, in the order they were created — the sequence the
 * catalogue was set up in, which is how the grid is meant to read.
 *
 * The public endpoint hardcodes `.sort({ name: 1 })` and takes no sort option,
 * so the ordering is restored here from each record's createdAt.
 *
 * @returns {Promise<object[]>}
 */
export async function getCategories(options = {}) {
  const response = await api.get(ENDPOINTS.categories.list, cached(options));
  return bySequence(formatCategories(response?.data?.categories));
}

/**
 * Same as getCategories, but a dead/erroring backend yields an empty list
 * instead of throwing. Use it where a missing menu should not take the whole
 * page down (layout, homepage grid).
 * @returns {Promise<object[]>}
 */
export async function getCategoriesSafe(options = {}) {
  try {
    return await getCategories(options);
  } catch (error) {
    console.error("[categoryService] getCategories failed:", error.message);
    return [];
  }
}

/**
 * One active category by slug. Returns null when the backend answers 404.
 * @returns {Promise<object|null>}
 */
export async function getCategoryBySlug(slug, options = {}) {
  if (!slug) return null;

  try {
    const response = await api.get(
      ENDPOINTS.categories.bySlug(slug),
      cached(options)
    );
    return formatCategory(response?.data?.category);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * One active category by id. Returns null when the backend answers 404.
 * @returns {Promise<object|null>}
 */
export async function getCategoryById(id, options = {}) {
  if (!id) return null;

  try {
    const response = await api.get(
      ENDPOINTS.categories.byId(id),
      cached(options)
    );
    return formatCategory(response?.data?.category);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// ======================================================
// ADMIN — every call needs a bearer token
// ======================================================

/**
 * Admin list: search + status + sort + pagination.
 * @returns {Promise<{ categories: object[], pagination: object }>}
 */
export async function getAdminCategories(params = {}, options = {}) {
  const {
    search = "",
    status = "all",
    sort = "name_asc",
    page = 1,
    limit = 10,
  } = params;

  const response = await api.get(ENDPOINTS.categories.adminList, {
    ...options,
    params: { search, status, sort, page, limit },
  });

  return {
    categories: formatCategories(response?.data?.categories),
    pagination: formatPagination(response?.data?.pagination),
  };
}

/** @returns {Promise<object|null>} the created category */
export async function createCategory(payload, options = {}) {
  const response = await api.post(
    ENDPOINTS.categories.create,
    {
      name: payload?.name,
      slug: payload?.slug,
      description: payload?.description,
      image: { url: payload?.image?.url ?? payload?.image ?? "" },
    },
    options
  );
  return formatCategory(response?.data?.category);
}

/** @returns {Promise<object|null>} the updated category */
export async function updateCategory(id, payload, options = {}) {
  // Only send the fields the caller actually set — the controller treats
  // `undefined` as "leave it alone".
  const body = {};
  if (payload?.name !== undefined) body.name = payload.name;
  if (payload?.slug !== undefined) body.slug = payload.slug;
  if (payload?.description !== undefined) body.description = payload.description;
  if (payload?.image !== undefined) {
    body.image = { url: payload.image?.url ?? payload.image ?? "" };
  }

  const response = await api.put(ENDPOINTS.categories.update(id), body, options);
  return formatCategory(response?.data?.category);
}

/** @returns {Promise<object|null>} the category with its new status */
export async function updateCategoryStatus(id, isActive, options = {}) {
  const response = await api.patch(
    ENDPOINTS.categories.status(id),
    { isActive: Boolean(isActive) },
    options
  );
  return formatCategory(response?.data?.category);
}

/** Soft delete (the controller flips isActive to false). */
export async function deleteCategory(id, options = {}) {
  const response = await api.delete(ENDPOINTS.categories.remove(id), options);
  return { success: true, message: response?.message || "Category deleted" };
}

export const categoryService = {
  getCategories,
  getCategoriesSafe,
  getCategoryBySlug,
  getCategoryById,
  getAdminCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};

export default categoryService;
