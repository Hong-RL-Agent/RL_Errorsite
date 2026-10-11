const API_BASE = "http://localhost:9716";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "요청을 처리하지 못했습니다.");
  }
  return payload;
}

export const api = {
  base: API_BASE,
  getHealth: () => request("/api/health"),
  getProducts: (params = {}) => request(`/api/products?${new URLSearchParams(params)}`),
  getProduct: (id) => request(`/api/products/${id}`),
  createProduct: (body) => request("/api/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),
  getCategories: () => request("/api/categories"),
  getUsers: () => request("/api/users"),
  getUser: (id) => request(`/api/users/${id}`),
  getUserProducts: (id) => request(`/api/users/${id}/products`),
  getFavorites: (userId = 1) => request(`/api/favorites?userId=${userId}`),
  addFavorite: (body) => request("/api/favorites", { method: "POST", body: JSON.stringify(body) }),
  removeFavorite: (productId, userId = 1) => request(`/api/favorites/${productId}?userId=${userId}`, { method: "DELETE" }),
  getReservations: (userId = 1) => request(`/api/reservations?userId=${userId}`),
  createReservation: (body) => request("/api/reservations", { method: "POST", body: JSON.stringify(body) }),
  updateReservation: (id, body) => request(`/api/reservations/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteReservation: (id) => request(`/api/reservations/${id}`, { method: "DELETE" }),
  getTransactions: (userId = 1) => request(`/api/transactions?userId=${userId}`),
  completeTransaction: (id) => request(`/api/transactions/${id}/complete`, { method: "POST" }),
  getChats: (userId = 1) => request(`/api/chats?userId=${userId}`),
  getMessages: (id) => request(`/api/chats/${id}/messages`),
  sendMessage: (id, body) => request(`/api/chats/${id}/messages`, { method: "POST", body: JSON.stringify(body) }),
  getNotifications: (userId = 1) => request(`/api/notifications?userId=${userId}`),
  getActivity: (userId = 1) => request(`/api/activity?userId=${userId}`),
  reset: () => request("/api/test/reset", { method: "POST" })
};
