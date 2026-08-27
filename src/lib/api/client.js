// ---------------------------------------------------------------------------
// Thin fetch wrapper around the Express backend.
//
// Works unchanged in Server Components and in the browser: caching options are
// only forwarded when a caller asks for them, so a client-side call behaves
// like a plain fetch.
//
// Every backend response is `{ success, message?, data? }`, so this layer
// unwraps nothing — services pick what they need out of `data` — but it does
// turn any non-2xx / `success: false` answer into a thrown ApiError.
// ---------------------------------------------------------------------------

import { API_BASE_URL, API_TIMEOUT } from "./config";

export class ApiError extends Error {
  constructor(message, { status = 0, payload = null, url = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.url = url;
  }
}

/** `/categories` + `{ status: "active" }` -> `<base>/categories?status=active` */
const buildUrl = (path, params) => {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params) return url;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.append(key, String(value));
  }

  const qs = query.toString();
  return qs ? `${url}?${qs}` : url;
};

/** Caller's own signal wins; otherwise the request gets a timeout signal. */
const resolveSignal = (signal) => {
  const timeout = AbortSignal.timeout(API_TIMEOUT);
  if (!signal) return timeout;
  return typeof AbortSignal.any === "function"
    ? AbortSignal.any([signal, timeout])
    : signal;
};

const parseBody = async (response) => {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    const text = await response.text().catch(() => "");
    return text || null;
  }
  return response.json().catch(() => null);
};

/**
 * @param {string} path      endpoint from ENDPOINTS
 * @param {object} [options]
 * @param {string} [options.method]     defaults to GET
 * @param {object} [options.body]       JSON-serialised automatically
 * @param {object} [options.params]     query string values
 * @param {string} [options.token]      bearer token for protected routes
 * @param {string} [options.credentials] "include" to send/receive the refresh
 *                                       cookie on cross-origin auth calls
 * @param {number} [options.revalidate] seconds — server-side ISR only
 * @param {string[]} [options.tags]     cache tags for revalidateTag()
 * @returns {Promise<any>} the parsed `{ success, message, data }` envelope
 */
export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    params,
    token,
    headers = {},
    signal,
    cache,
    revalidate,
    tags,
    credentials,
  } = options;

  const url = buildUrl(path, params);

  const init = {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    signal: resolveSignal(signal),
  };

  // Auth routes exchange an httpOnly refresh cookie; everything else stays
  // cookie-less so ordinary catalogue reads remain cacheable.
  if (credentials) init.credentials = credentials;

  if (body !== undefined) init.body = JSON.stringify(body);

  // fetch is uncached by default in Next 16 — opt in explicitly when the
  // caller asked for it, and leave browser calls alone.
  if (cache) init.cache = cache;
  if (revalidate !== undefined || tags) {
    init.next = {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags ? { tags } : {}),
    };
  }

  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    // Network down, DNS failure, timeout — the backend never answered.
    throw new ApiError(
      error?.name === "TimeoutError"
        ? "The server took too long to respond."
        : "Could not reach the server. Please try again.",
      { url }
    );
  }

  const payload = await parseBody(response);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      { status: response.status, payload, url }
    );
  }

  return payload;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    apiRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};

export default api;
