// ---------------------------------------------------------------------------
// Category formatter
//
// Turns a raw Mongo document from the backend
//   { _id, name, slug, description, image: { url }, isActive, createdAt, ... }
// into the flat shape the UI already reads
//   { id, name, slug, tagline, image, href, isActive, tint, ... }
//
// Keeping the mapping here means a backend field rename touches one file.
// ---------------------------------------------------------------------------

/** All category pages live under this route segment. */
export const CATEGORY_BASE_PATH = "/category";

// Tile colour used only when a category has no image yet. Picked from the
// slug so the same category always gets the same colour.
const FALLBACK_TINTS = [
  "#f06048",
  "#ffc000",
  "#904890",
  "#4890c0",
  "#48c0a8",
  "#4860a8",
  "#f06018",
  "#e91e78",
];

const tintFor = (slug = "") => {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return FALLBACK_TINTS[hash % FALLBACK_TINTS.length];
};

const slugify = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * @param {object} raw category document from the API
 * @returns {object|null} UI-ready category, or null for an unusable record
 */
export function formatCategory(raw) {
  if (!raw || typeof raw !== "object") return null;

  const name = (raw.name || "").trim();
  const slug = (raw.slug || slugify(name)).trim();
  if (!slug) return null;

  const description = (raw.description || "").trim();

  // The API sends `image: { url }`, but an empty url must not fall through to
  // the wrapper object. A plain string is accepted too.
  const image = (
    typeof raw.image === "string" ? raw.image : raw.image?.url || ""
  ).trim();

  return {
    id: raw._id || raw.id || slug,
    name: name || slug,
    slug,
    description,
    // The grid/category page label this line "tagline"; the backend calls the
    // same copy "description".
    tagline: description,
    image,
    href: `${CATEGORY_BASE_PATH}/${slug}`,
    isActive: raw.isActive !== false,
    tint: tintFor(slug),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
  };
}

/** Formats a list and drops anything unusable. Backend order is preserved. */
export function formatCategories(list) {
  if (!Array.isArray(list)) return [];
  return list.map(formatCategory).filter(Boolean);
}

/** Normalises the admin list's pagination block. */
export function formatPagination(raw) {
  return {
    page: Number(raw?.page) || 1,
    limit: Number(raw?.limit) || 10,
    totalCategories: Number(raw?.totalCategories) || 0,
    totalPages: Number(raw?.totalPages) || 0,
  };
}
