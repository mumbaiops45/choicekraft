// ---------------------------------------------------------------------------
// User formatter
//
// Login/register return a trimmed user object; /auth/me and /users/profile
// return the full document. This flattens both onto one shape.
// ---------------------------------------------------------------------------

export function formatUser(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id || raw._id || "";
  if (!id) return null;

  const name = (raw.name || "").trim();

  return {
    id,
    name,
    email: (raw.email || "").trim(),
    phone: (raw.phone || "").trim(),
    role: raw.role || "customer",
    isVerified: Boolean(raw.isVerified),
    isActive: raw.isActive !== false,
    /** "Priya Sharma" -> "PS", for the account panel's avatar. */
    initials:
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?",
    isAdmin: raw.role === "admin",
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
  };
}

export default formatUser;
