// ---------------------------------------------------------------------------
// Address formatter
// ---------------------------------------------------------------------------

/** "12 Link Road, Flat 4, Pune, Maharashtra 411001, India" */
const oneLine = (raw) =>
  [
    raw.addressLine1,
    raw.addressLine2,
    raw.city,
    `${raw.state || ""} ${raw.postalCode || ""}`.trim(),
    raw.country,
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");

export function formatAddress(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw._id || raw.id || "";
  if (!id) return null;

  return {
    id,
    name: (raw.name || "").trim(),
    phone: (raw.phone || "").trim(),
    addressLine1: (raw.addressLine1 || "").trim(),
    addressLine2: (raw.addressLine2 || "").trim(),
    city: (raw.city || "").trim(),
    state: (raw.state || "").trim(),
    postalCode: (raw.postalCode || "").trim(),
    country: (raw.country || "India").trim(),
    addressType: raw.addressType || "home",
    isDefault: Boolean(raw.isDefault),
    oneLine: oneLine(raw),
    createdAt: raw.createdAt || null,
  };
}

/** The backend already sorts default-first, newest-next. Order is preserved. */
export function formatAddresses(list) {
  if (!Array.isArray(list)) return [];
  return list.map(formatAddress).filter(Boolean);
}

/** The fields createAddress/updateAddress accept. */
export const toAddressPayload = (form = {}) => ({
  name: (form.name || "").trim(),
  phone: (form.phone || "").trim(),
  addressLine1: (form.addressLine1 || "").trim(),
  addressLine2: (form.addressLine2 || "").trim(),
  city: (form.city || "").trim(),
  state: (form.state || "").trim(),
  postalCode: (form.postalCode || "").trim(),
  country: (form.country || "India").trim(),
  addressType: form.addressType || "home",
  ...(form.isDefault !== undefined ? { isDefault: Boolean(form.isDefault) } : {}),
});
