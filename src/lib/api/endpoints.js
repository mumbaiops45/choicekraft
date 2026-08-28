// ---------------------------------------------------------------------------
// Every backend path the frontend talks to, in one place.
// Paths are relative to API_BASE_URL — no leading host, no query strings.
// ---------------------------------------------------------------------------

export const ENDPOINTS = {
  categories: {
    // Public
    list: "/categories",
    bySlug: (slug) => `/categories/slug/${encodeURIComponent(slug)}`,
    byId: (id) => `/categories/${encodeURIComponent(id)}`,

    // Admin (protect + adminOnly)
    adminList: "/categories/admin/all",
    create: "/categories",
    update: (id) => `/categories/${encodeURIComponent(id)}`,
    status: (id) => `/categories/${encodeURIComponent(id)}/status`,
    remove: (id) => `/categories/${encodeURIComponent(id)}`,
  },

  products: {
    // Public
    list: "/products",
    bySlug: (slug) => `/products/slug/${encodeURIComponent(slug)}`,
    byId: (id) => `/products/${encodeURIComponent(id)}`,

    // Admin (protect + adminOnly)
    adminList: "/products/admin/all",
    create: "/products",
    update: (id) => `/products/${encodeURIComponent(id)}`,
    status: (id) => `/products/${encodeURIComponent(id)}/status`,
    remove: (id) => `/products/${encodeURIComponent(id)}`,
  },

  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    logoutAll: "/auth/logout-all",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
    sendVerification: "/auth/send-verification",
    verifyEmail: "/auth/verify-email",
  },

  users: {
    profile: "/users/profile",
  },

  // Mounted under the users router on the server, not at /addresses.
  addresses: {
    list: "/users/addresses",
    byId: (id) => `/users/addresses/${encodeURIComponent(id)}`,
    create: "/users/addresses",
    update: (id) => `/users/addresses/${encodeURIComponent(id)}`,
    setDefault: (id) => `/users/addresses/${encodeURIComponent(id)}/default`,
    remove: (id) => `/users/addresses/${encodeURIComponent(id)}`,
  },

  checkout: {
    preview: "/checkout",
  },

  // Singular "payment" — /payments/* is not mounted.
  payment: {
    createOrder: "/payment/create-order",
    verify: "/payment/verify",
  },

  orders: {
    list: "/orders",
    // Cash on delivery places the order directly: POST /orders.
    // The online path goes through POST /payment/create-order instead.
    cod: "/orders",
    // Declared before /orders/:id on the server, so it is a real route and
    // not an order id.
    cancelReasons: "/orders/cancel-reasons",
    cancel: (id) => `/orders/${encodeURIComponent(id)}/cancel`,
    byId: (id) => `/orders/${encodeURIComponent(id)}`,
  },

  wishlist: {
    list: "/wishlist",
    add: (productId) => `/wishlist/${encodeURIComponent(productId)}`,
    check: (productId) => `/wishlist/${encodeURIComponent(productId)}`,
    remove: (productId) => `/wishlist/${encodeURIComponent(productId)}`,
    clear: "/wishlist",
  },

  cart: {
    get: "/cart",
    add: "/cart",
    updateItem: (itemId) => `/cart/item/${encodeURIComponent(itemId)}`,
    removeItem: (itemId) => `/cart/item/${encodeURIComponent(itemId)}`,
    clear: "/cart",
  },
};

export default ENDPOINTS;
