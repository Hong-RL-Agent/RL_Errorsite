const API_BASE = "http://localhost:9720";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "요청 처리에 실패했습니다.");
  return payload;
}

export const api = {
  base: API_BASE,
  health: () => request("/api/health"),
  users: (q = "") => request(`/api/users?${new URLSearchParams({ q })}`),
  user: (id) => request(`/api/users/${id}`),
  profile: (id) => request(`/api/users/${id}/profile`),
  updateProfile: (id, body) => request(`/api/users/${id}/profile`, { method: "PATCH", body: JSON.stringify(body) }),
  startSignup: (body) => request("/api/auth/signup/start", { method: "POST", body: JSON.stringify(body) }),
  checkEmail: (email) => request("/api/auth/check-email", { method: "POST", body: JSON.stringify({ email }) }),
  sendCode: (body) => request("/api/auth/verification/send", { method: "POST", body: JSON.stringify(body) }),
  confirmCode: (body) => request("/api/auth/verification/confirm", { method: "POST", body: JSON.stringify(body) }),
  completeSignup: (body) => request("/api/auth/signup/complete", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  progress: (id) => request(`/api/signup/progress/${id}`),
  updateProgress: (id, body) => request(`/api/signup/progress/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  onboarding: () => request("/api/onboarding"),
  settings: (id) => request(`/api/accounts/${id}/settings`),
  updateSettings: (id, body) => request(`/api/accounts/${id}/settings`, { method: "PATCH", body: JSON.stringify(body) }),
  changePassword: (id, body) => request(`/api/accounts/${id}/password`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteAccount: (id) => request(`/api/accounts/${id}`, { method: "DELETE" }),
  notifications: (userId = 1) => request(`/api/notifications?userId=${userId}`),
  readNotification: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
  activity: (userId = 1) => request(`/api/activity?userId=${userId}`),
  reset: () => request("/api/test/reset", { method: "POST" })
};
