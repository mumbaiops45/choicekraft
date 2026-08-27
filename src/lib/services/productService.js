// ---------------------------------------------------------------------------
// Product service — one function per backend route (product.routes.js).
//
// The public list supports search + category + sort + pagination, so filtering
// happens on the server wherever possible instead of pulling the whole
// catalogue down and filtering in the browser.
// ---------------------------------------------------------------------------

import { api, ApiError } from "@/lib/api/client";
import { CATEGORY_REVALIDATE } from "@/lib/api/config";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  formatProduct,
  formatProducts,
  formatProductPagination,
} from "@/lib/formatters/product";

export const PRODUCT_CACHE_TAG = "products";

/** Big enough to hold the whole catalogue in one page. */
export const CATALOGUE_LIMIT = 100;

/** Backend sort key for "the order they were created", i.e. 1, 2, 3… */
export const SEQUENTIAL_SORT = "oldest";

const cached = (options = {}) =>
  CATEGORY_REVALIDATE > 0
    ? {
        cache: "force-cache",
        revalidate: CATEGORY_REVALIDATE,
        tags: [PRODUCT_CACHE_TAG],
        ...options,
      }
    : { cache: "no-store", ...options };

const EMPTY = {
  products: [],
  pagination: formatProductPagination(null),
};

// ======================================================
// PUBLIC
// ======================================================

/**
 * Search + filter + sort + paginate the active catalogue.
 *
 * @param {object} [params]
 * @param {string} [params.search]   free-text query
 * @param {string} [params.category] category slug or id
 * @param {string} [params.sort]     backend sort key, e.g. "price_asc"
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @returns {Promise<{ products: object[], pagination: object }>}
 */
export async function getProducts(params = {}, options = {}) {
  const {
    search,
    category,
    // Oldest first: products list in the sequence they were added, not newest
    // first. Pass an explicit sort to override.
    sort = SEQUENTIAL_SORT,
    page,
    limit = CATALOGUE_LIMIT,
  } = params;

  const response = await api.get(ENDPOINTS.products.list, {
    ...cached(options),
    params: { search, category, sort, page, limit },
  });

  return {
    products: formatProducts(response?.data?.products),
    pagination: formatProductPagination(response?.data?.pagination),
  };
}

/**
 * getProducts with a dead backend downgraded to an empty catalogue, so one
 * failing request cannot take a whole page down.
 */
export async function getProductsSafe(params = {}, options = {}) {
  try {
    return await getProducts(params, options);
  } catch (error) {
    console.error("[productService] getProducts failed:", error.message);
    return EMPTY;
  }
}

/** Every active product. */
export async function getAllProducts(options = {}) {
  const { products } = await getProductsSafe({}, options);
  return products;
}

/** Active products in one category, by slug. */
export async function getProductsByCategory(slug, options = {}) {
  if (!slug) return [];
  const { products } = await getProductsSafe({ category: slug }, options);
  return products;
}

/** The note books ChoiceKraft prints itself. */
export async function getNotebooks(options = {}) {
  return getProductsByCategory("notebooks", options);
}

/** Everything except the note books. */
export async function getStationeryProducts(options = {}) {
  const products = await getAllProducts(options);
  return products.filter((product) => product.kind !== "book");
}

/** One product by slug. Returns null when the backend answers 404. */
export async function getProductBySlug(slug, options = {}) {
  if (!slug) return null;

  try {
    const response = await api.get(
      ENDPOINTS.products.bySlug(slug),
      cached(options)
    );
    return formatProduct(response?.data?.product);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** One product by id. Returns null when the backend answers 404. */
export async function getProductById(id, options = {}) {
  if (!id) return null;

  try {
    const response = await api.get(
      ENDPOINTS.products.byId(id),
      cached(options)
    );
    return formatProduct(response?.data?.product);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// ======================================================
// ADMIN — every call needs a bearer token
// ======================================================

export async function getAdminProducts(params = {}, options = {}) {
  const {
    search = "",
    category = "",
    status = "all",
    sort = "newest",
    page = 1,
    limit = 10,
  } = params;

  const response = await api.get(ENDPOINTS.products.adminList, {
    ...options,
    params: { search, category, status, sort, page, limit },
  });

  return {
    products: formatProducts(response?.data?.products),
    pagination: formatProductPagination(response?.data?.pagination),
  };
}

/** Maps the UI's flat shape back onto the backend's document shape. */
const toPayload = (payload = {}) => {
  const body = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  // The cards' "type" label and the backend's "description" are one field.
  const description = payload.description ?? payload.type;
  if (description !== undefined) body.description = description;
  if (payload.category !== undefined) body.category = payload.category;
  if (payload.price !== undefined) body.price = Number(payload.price);
  const mrp = payload.compareAtPrice ?? payload.mrp;
  if (mrp !== undefined) body.compareAtPrice = mrp === null ? null : Number(mrp);
  if (payload.image !== undefined) {
    body.image = { url: payload.image?.url ?? payload.image ?? "" };
  }
  if (payload.stock !== undefined) body.stock = Number(payload.stock);
  if (payload.hasVariants !== undefined) {
    body.hasVariants = Boolean(payload.hasVariants);
  }
  return body;
};

export async function createProduct(payload, options = {}) {
  const response = await api.post(
    ENDPOINTS.products.create,
    toPayload(payload),
    options
  );
  return formatProduct(response?.data?.product);
}

export async function updateProduct(id, payload, options = {}) {
  const response = await api.put(
    ENDPOINTS.products.update(id),
    toPayload(payload),
    options
  );
  return formatProduct(response?.data?.product);
}

export async function updateProductStatus(id, isActive, options = {}) {
  const response = await api.patch(
    ENDPOINTS.products.status(id),
    { isActive: Boolean(isActive) },
    options
  );
  return formatProduct(response?.data?.product);
}

export async function deleteProduct(id, options = {}) {
  const response = await api.delete(ENDPOINTS.products.remove(id), options);
  return { success: true, message: response?.message || "Product deleted" };
}

export const productService = {
  getProducts,
  getProductsSafe,
  getAllProducts,
  getProductsByCategory,
  getNotebooks,
  getStationeryProducts,
  getProductBySlug,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};

export default productService;
