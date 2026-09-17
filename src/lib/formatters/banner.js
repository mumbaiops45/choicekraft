// ---------------------------------------------------------------------------
// Banner formatter
//
// Turns a raw Mongo document from the backend
//   { _id, title, description, discount, image: { url }, link, buttonText,
//     type, position, isActive, startDate, endDate, createdAt,
//     productId?, product?, ... }
// into the flat shape the UI reads
//   { id, title, description, discount, image, link, href, buttonText, type,
//     position, isActive, createdAt, updatedAt }
//
// `productId` / `product` are not on the schema yet — the Banner model only
// has a free-text `link`. Reading them defensively means the frontend starts
// preferring a real product reference the moment the backend adds one,
// without another round of changes here.
// ---------------------------------------------------------------------------

/**
 * @param {object} raw banner document from the API
 * @returns {object|null} UI-ready banner, or null for an unusable record
 */
export function formatBanner(raw) {
  if (!raw || typeof raw !== "object") return null;

  // The API sends `image: { url }`, but a plain string is accepted too.
  const image = (
    typeof raw.image === "string" ? raw.image : raw.image?.url || ""
  ).trim();
  if (!image) return null;

  // Not on the schema yet. `product` may arrive populated ({ _id, slug, ... })
  // or as a bare id string; `productId` covers an unpopulated foreign key.
  const productSlug = (raw.product?.slug || raw.productSlug || "").trim();
  const productId = (
    raw.productId ||
    raw.product?._id ||
    (typeof raw.product === "string" ? raw.product : "") ||
    ""
  )
    .toString()
    .trim();

  const link = (raw.link || "").trim();

  return {
    id: raw._id || raw.id,
    title: (raw.title || "").trim(),
    description: (raw.description || "").trim(),
    discount: (raw.discount || "").trim(),
    image,
    link,
    productId,
    productSlug,
    // Where the banner actually points: a specific product once the backend
    // gives us one, the free-text link otherwise.
    href: productSlug
      ? `/products/${productSlug}`
      : productId
        ? `/products/${productId}`
        : link,
    buttonText: (raw.buttonText || "").trim(),
    type: raw.type || "homepage",
    position: Number.isFinite(raw.position) ? raw.position : 0,
    isActive: raw.isActive !== false,
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
  };
}

/**
 * Formats a list, drops anything unusable, and sorts by `position` —
 * the field the admin reorder endpoint writes. Ties keep the backend's own
 * order rather than being scrambled by an unstable sort.
 */
export function formatBanners(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item, index) => ({ item: formatBanner(item), index }))
    .filter((entry) => entry.item)
    .sort((a, b) => a.item.position - b.item.position || a.index - b.index)
    .map((entry) => entry.item);
}

/** Normalises the admin list's pagination block. */
export function formatPagination(raw) {
  return {
    page: Number(raw?.page) || 1,
    limit: Number(raw?.limit) || 10,
    totalBanners: Number(raw?.totalBanners) || 0,
    totalPages: Number(raw?.totalPages) || 0,
  };
}
