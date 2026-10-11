const API_BASE = "http://localhost:9722";

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
  boards: () => request("/api/boards"),
  threads: (params = {}) => request(`/api/threads?${new URLSearchParams(params)}`),
  thread: (id, userId = 1) => request(`/api/threads/${id}?userId=${userId}`),
  createThread: (body) => request("/api/threads", { method: "POST", body: JSON.stringify(body) }),
  updateThread: (id, body) => request(`/api/threads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteThread: (id) => request(`/api/threads/${id}`, { method: "DELETE" }),
  replies: (id) => request(`/api/threads/${id}/replies`),
  createReply: (id, body) => request(`/api/threads/${id}/replies`, { method: "POST", body: JSON.stringify(body) }),
  updateReply: (id, body) => request(`/api/replies/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteReply: (id) => request(`/api/replies/${id}`, { method: "DELETE" }),
  recommend: (id, userId = 1) => request(`/api/threads/${id}/recommend`, { method: "POST", body: JSON.stringify({ userId }) }),
  unrecommend: (id, userId = 1) => request(`/api/threads/${id}/recommend?userId=${userId}`, { method: "DELETE" }),
  bookmarks: (userId = 1) => request(`/api/bookmarks?userId=${userId}`),
  addBookmark: (body) => request("/api/bookmarks", { method: "POST", body: JSON.stringify(body) }),
  removeBookmark: (threadId, userId = 1) => request(`/api/bookmarks/${threadId}?userId=${userId}`, { method: "DELETE" }),
  drafts: (userId = 1) => request(`/api/drafts?userId=${userId}`),
  createDraft: (body) => request("/api/drafts", { method: "POST", body: JSON.stringify(body) }),
  updateDraft: (id, body) => request(`/api/drafts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  resolve: (id) => request(`/api/threads/${id}/resolve`, { method: "POST" }),
  tags: () => request("/api/tags"),
  users: () => request("/api/users"),
  notifications: (userId = 1) => request(`/api/notifications?userId=${userId}`),
  readNotification: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
  activity: (userId = 1) => request(`/api/activity?userId=${userId}`),
  reset: () => request("/api/test/reset", { method: "POST" })
};
