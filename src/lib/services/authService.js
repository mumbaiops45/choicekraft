// ---------------------------------------------------------------------------
// Auth service — one function per route in auth.routes.js.
//
// Two tokens are in play:
//   accessToken  — returned in the JSON body, short-lived, held in memory by
//                  the auth store and sent as `Authorization: Bearer …`.
//   refreshToken — never visible to JS. The backend sets it as an httpOnly
//                  cookie scoped to /api/auth, so every call here passes
//                  `credentials: "include"` or the cookie is neither sent nor
//                  stored.
//
// Auth calls are always live — caching a login would be nonsense.
// ---------------------------------------------------------------------------

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatUser } from "@/lib/formatters/user";

/** Every auth call needs the refresh cookie to travel with it. */
const withCookies = (options = {}) => ({
  cache: "no-store",
  credentials: "include",
  ...options,
});

const readSession = (response) => ({
  user: formatUser(response?.data?.user),
  accessToken: response?.data?.accessToken || "",
  message: response?.message || "",
});

// ======================================================
// SESSION
// ======================================================

/**
 * @param {{name: string, email: string, password: string, phone?: string}} payload
 * @returns {Promise<{user: object|null, accessToken: string, message: string}>}
 */
export async function register(payload, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.register,
    {
      name: payload?.name,
      email: payload?.email,
      password: payload?.password,
      ...(payload?.phone ? { phone: payload.phone } : {}),
    },
    withCookies(options)
  );
  return readSession(response);
}

/** @returns {Promise<{user: object|null, accessToken: string, message: string}>} */
export async function login(credentials, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.login,
    { email: credentials?.email, password: credentials?.password },
    withCookies(options)
  );
  return readSession(response);
}

/**
 * Trades the refresh cookie for a fresh access token. This is what restores a
 * session after a page reload — the access token itself is never persisted.
 *
 * @returns {Promise<string>} the new access token
 */
export async function refresh(options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.refresh,
    undefined,
    withCookies(options)
  );
  return response?.data?.accessToken || "";
}

/** Revokes this device's refresh token and clears the cookie. */
export async function logout(options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.logout,
    undefined,
    withCookies(options)
  );
  return { success: true, message: response?.message || "Logout successful" };
}

/** Revokes every refresh token for the signed-in user. */
export async function logoutAll(token, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.logoutAll,
    undefined,
    withCookies({ token, ...options })
  );
  return { success: true, message: response?.message || "" };
}

/** The signed-in user, or null when the token is missing or rejected. */
export async function getMe(token, options = {}) {
  if (!token) return null;
  const response = await api.get(
    ENDPOINTS.auth.me,
    withCookies({ token, ...options })
  );
  return formatUser(response?.data?.user);
}

// ======================================================
// PASSWORD
// ======================================================

/** Always reports success — the backend will not reveal whether an email exists. */
export async function forgotPassword(email, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.forgotPassword,
    { email },
    withCookies(options)
  );
  return { success: true, message: response?.message || "" };
}

export async function resetPassword(token, password, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.resetPassword,
    { token, password },
    withCookies(options)
  );
  return { success: true, message: response?.message || "" };
}

/** PATCH, not POST — see auth.routes.js. Revokes every session on success. */
export async function changePassword(token, payload, options = {}) {
  const response = await api.patch(
    ENDPOINTS.auth.changePassword,
    {
      currentPassword: payload?.currentPassword,
      newPassword: payload?.newPassword,
    },
    withCookies({ token, ...options })
  );
  return { success: true, message: response?.message || "" };
}

// ======================================================
// EMAIL VERIFICATION
// ======================================================

export async function sendVerification(token, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.sendVerification,
    undefined,
    withCookies({ token, ...options })
  );
  return { success: true, message: response?.message || "" };
}

export async function verifyEmail(token, options = {}) {
  const response = await api.post(
    ENDPOINTS.auth.verifyEmail,
    { token },
    withCookies(options)
  );
  return { success: true, message: response?.message || "" };
}

// ======================================================
// PROFILE (users.routes.js — protected)
// ======================================================

export async function getMyProfile(token, options = {}) {
  const response = await api.get(
    ENDPOINTS.users.profile,
    withCookies({ token, ...options })
  );
  return formatUser(response?.data?.user);
}

export async function updateMyProfile(token, payload, options = {}) {
  const body = {};
  if (payload?.name !== undefined) body.name = payload.name;
  if (payload?.phone !== undefined) body.phone = payload.phone;

  const response = await api.put(
    ENDPOINTS.users.profile,
    body,
    withCookies({ token, ...options })
  );
  return formatUser(response?.data?.user);
}

export const authService = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  sendVerification,
  verifyEmail,
  getMyProfile,
  updateMyProfile,
};

export default authService;
