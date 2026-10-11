const API_BASE = "http://localhost:9718";

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
  health: () => request("/api/health"),
  movies: (params = {}) => request(`/api/movies?${new URLSearchParams(params)}`),
  movie: (id) => request(`/api/movies/${id}`),
  theaters: (params = {}) => request(`/api/theaters?${new URLSearchParams(params)}`),
  theater: (id) => request(`/api/theaters/${id}`),
  screens: () => request("/api/screens"),
  showtimes: (params = {}) => request(`/api/showtimes?${new URLSearchParams(params)}`),
  showtime: (id) => request(`/api/showtimes/${id}`),
  seats: (id) => request(`/api/showtimes/${id}/seats`),
  customers: () => request("/api/customers"),
  bookings: (customerId = 1) => request(`/api/bookings?customerId=${customerId}`),
  booking: (id) => request(`/api/bookings/${id}`),
  createBooking: (body) => request("/api/bookings", { method: "POST", body: JSON.stringify(body) }),
  updateBooking: (id, body) => request(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  cancelBooking: (id) => request(`/api/bookings/${id}/cancel`, { method: "POST" }),
  changeSeats: (id, body) => request(`/api/bookings/${id}/seats`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteBooking: (id) => request(`/api/bookings/${id}`, { method: "DELETE" }),
  statistics: (customerId = 1) => request(`/api/booking-statistics?customerId=${customerId}`),
  notifications: (customerId = 1) => request(`/api/notifications?customerId=${customerId}`),
  readNotification: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
  activity: (customerId = 1) => request(`/api/activity?customerId=${customerId}`),
  reset: () => request("/api/test/reset", { method: "POST" })
};
