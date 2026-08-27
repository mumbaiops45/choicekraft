// ---------------------------------------------------------------------------
// Product formatter
//
// Maps a raw product document
//   { _id, name, slug, description, category: { name, slug }, price,
//     compareAtPrice, image: { url }, stock, hasVariants, isActive }
// onto the flat shape the UI already reads
//   { id, name, slug, type, category, kind, price, mrp, image, ... }
//
// Two fields are derived rather than stored:
//   type — the small uppercase label over each card ("Hauser", "A4 Long Book").
//          The backend keeps that copy in `description`.
//   kind — "book" for the note books ChoiceKraft prints itself, "stationery"
//          for everything else. The cards use it to pick a book cover's
//          707:1000 ratio over a square product shot.
// ---------------------------------------------------------------------------

import { quoteFor } from "@/lib/data/notebookQuotes";

/** Category slug whose products are ChoiceKraft's own printed note books. */
export const BOOK_CATEGORY_SLUG = "notebooks";

/** `category` arrives populated, or as a bare id when it is not. */
const readCategory = (raw) => {
  const category = raw?.category;
  if (!category) return { slug: "", name: "" };
  if (typeof category === "string") return { slug: "", name: "", id: category };
  return {
    id: category._id || "",
    slug: (category.slug || "").trim(),
    name: (category.name || "").trim(),
  };
};

const readImage = (raw) =>
  (typeof raw?.image === "string" ? raw.image : raw?.image?.url || "").trim();

/**
 * @param {object} raw product document from the API
 * @returns {object|null} UI-ready product, or null for an unusable record
 */
export function formatProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  const slug = (raw.slug || "").trim();
  const name = (raw.name || "").trim();
  if (!slug || !name) return null;

  const category = readCategory(raw);
  const price = Number(raw.price) || 0;
  const mrp = Number(raw.compareAtPrice) || null;
  const stock = Number(raw.stock) || 0;

  return {
    id: raw._id || raw.id || slug,
    name,
    slug,
    // Backend "description" is the short label the cards print above the name.
    type: (raw.description || "").trim(),
    description: (raw.description || "").trim(),

    category: category.slug,
    categoryName: category.name,
    categoryId: category.id || "",
    kind: category.slug === BOOK_CATEGORY_SLUG ? "book" : "stationery",

    price,
    // Only a genuine higher compare-at price counts as an MRP; otherwise the
    // cards would draw a strike-through over the same number.
    mrp: mrp && mrp > price ? mrp : null,

    // Cover quote. The backend has no field for it yet, so fall back to the
    // local list keyed by slug — see lib/data/notebookQuotes.js.
    quote: (raw.quote || "").trim() || quoteFor(slug),

    image: readImage(raw),
    stock,
    inStock: stock > 0,
    hasVariants: Boolean(raw.hasVariants),
    isActive: raw.isActive !== false,

    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
  };
}

/** Formats a list and drops anything unusable. Backend order is preserved. */
export function formatProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map(formatProduct).filter(Boolean);
}

/** Normalises the pagination block the product list returns. */
export function formatProductPagination(raw) {
  return {
    page: Number(raw?.page) || 1,
    limit: Number(raw?.limit) || 20,
    totalProducts: Number(raw?.totalProducts) || 0,
    totalPages: Number(raw?.totalPages) || 0,
    hasNextPage: Boolean(raw?.hasNextPage),
    hasPreviousPage: Boolean(raw?.hasPreviousPage),
  };
}
