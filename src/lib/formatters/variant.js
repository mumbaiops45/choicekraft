// ---------------------------------------------------------------------------
// Product variant formatter — variant.routes.js's public
// GET /products/:productId/variants.
//
// A variant is a priced, stocked option of a product ("144 Pages", "Red /
// Large", ...). `attributes` is free-form — the admin panel lets a variant
// carry any key/value pairs — but in practice every variant of one product
// tends to share the same single attribute (e.g. every option here has a
// "pages" key), which is what lets the storefront draw one row of buttons
// instead of a generic key/value list.
// ---------------------------------------------------------------------------

export function formatVariant(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw._id || raw.id || "";
  const name = (raw.name || "").trim();
  if (!id || !name) return null;

  const price = Number(raw.price) || 0;
  const mrp = Number(raw.compareAtPrice) || null;
  const stock = Number(raw.stock) || 0;

  return {
    id,
    name,
    price,
    mrp: mrp && mrp > price ? mrp : null,
    stock,
    inStock: stock > 0,
    // Mongoose serialises the schema's Map field to a plain object.
    attributes:
      raw.attributes && typeof raw.attributes === "object"
        ? raw.attributes
        : {},
  };
}

/**
 * Formats the list and orders it for display.
 *
 * The backend returns creation order, which is whatever sequence the admin
 * happened to add options in — not the order a shopper should see them ("144
 * Pages" before "80 Pages" reads wrong). When every variant shares exactly
 * one attribute key and its values all look numeric, sort by that value
 * ("80 Pages" < "144 Pages" < "176 Pages"). Otherwise fall back to price.
 */
export function formatVariants(list) {
  if (!Array.isArray(list)) return [];
  const variants = list.map(formatVariant).filter(Boolean);

  const keys = new Set();
  for (const v of variants) {
    for (const key of Object.keys(v.attributes)) keys.add(key);
  }

  if (keys.size === 1) {
    const [key] = keys;
    const numeric = variants.every((v) => {
      const value = v.attributes[key];
      return value !== undefined && value !== "" && !Number.isNaN(Number(value));
    });
    if (numeric) {
      return [...variants].sort(
        (a, b) => Number(a.attributes[key]) - Number(b.attributes[key])
      );
    }
  }

  return [...variants].sort((a, b) => a.price - b.price);
}

/** The one attribute name shared by every variant, or "" when there isn't a
    single one (mixed attribute sets, or none at all). Used as the picker's
    label ("Pages", "Size", ...). */
export function sharedAttributeLabel(variants) {
  const keys = new Set();
  for (const v of variants) {
    for (const key of Object.keys(v.attributes || {})) keys.add(key);
  }
  if (keys.size !== 1) return "";
  const [key] = keys;
  return key.charAt(0).toUpperCase() + key.slice(1);
}
