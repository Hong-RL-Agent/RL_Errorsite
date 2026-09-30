// CulturePick API Client
const API_BASE = '/api';

export function notifyBugDetected(bugInfo) {
  const event = new CustomEvent('culturepick-bug-detected', { detail: bugInfo });
  window.dispatchEvent(event);
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const bugHeader = res.headers.get('X-Bug-Triggered');
  if (bugHeader) {
    const bugInfoStr = res.headers.get('X-Bug-Info');
    let parsedInfo = null;
    try {
      if (bugInfoStr) parsedInfo = JSON.parse(decodeURIComponent(bugInfoStr));
    } catch (e) {}

    notifyBugDetected(parsedInfo || {
      id: bugHeader,
      endpoint: url,
      method: options.method || 'GET'
    });
  }

  if (!res.ok) {
    let errData = {};
    try {
      errData = await res.json();
    } catch (e) {}
    throw new Error(errData.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data && data._bug) {
    notifyBugDetected(data._bug);
  }

  return data;
}

export const api = {
  getHealth: () => request('/health'),
  getCategories: () => request('/categories'),
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.append(k, v);
    });
    const qs = query.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },
  getEventById: (id) => request(`/events/${id}`),
  getEventReviews: (eventId) => request(`/events/${eventId}/reviews`),
  createEventReview: (eventId, reviewData) => request(`/events/${eventId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
  getEventSchedules: (eventId) => request(`/events/${eventId}/schedules`),
  getScheduleSeats: (scheduleId) => request(`/schedules/${scheduleId}/seats`),
  selectSeat: (scheduleId, seatId) => request(`/schedules/${scheduleId}/seats/select`, {
    method: 'POST',
    body: JSON.stringify({ seatId })
  }),
  getVenues: () => request('/venues'),
  getVenueById: (id) => request(`/venues/${id}`),
  getRecommendations: () => request('/recommendations'),
  addFavorite: (eventId) => request(`/events/${eventId}/favorite`, {
    method: 'POST'
  }),
  removeFavorite: (eventId) => request(`/events/${eventId}/favorite`, {
    method: 'DELETE'
  }),
  getMyPage: () => request('/mypage')
};
