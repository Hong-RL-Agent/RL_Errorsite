// AutoCheck Frontend API Client

const BASE_URL = '/api';

/**
 * Standard fetch wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);

  // INTENTIONAL BACKEND BUG: site056-SEC-456
  // 204 No Content 응답을 JSON으로 무조건 파싱하는 오류:
  // DELETE /api/bookings/:id 등 서버에서 204 No Content (Empty Body)를 반환할 때
  // response.status === 204 또는 response.headers content-length 검사 없이
  // response.json()을 호출하여 SyntaxError: Unexpected end of JSON input 예외 발생
  if (response.ok) {
    // Blindly parse JSON for all successful status codes (including 204)
    return await response.json();
  }

  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || `요청 실패 (상태코드: ${response.status})`);
}

export const api = {
  // 차량 관련
  getVehicles: async (params = {}, signal = null) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.brand) query.set('brand', params.brand);
    if (params.model) query.set('model', params.model);
    if (params.region) query.set('region', params.region);
    if (params.priceMin) query.set('priceMin', params.priceMin);
    if (params.priceMax) query.set('priceMax', params.priceMax);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${BASE_URL}/vehicles${queryString}`, { signal });
    if (!res.ok) throw new Error('차량 목록을 불러오지 못했습니다.');
    return await res.json();
  },

  getVehicleById: async (id) => {
    return await request(`/vehicles/${id}`);
  },

  // 점검 센터 관련
  getCenters: async () => {
    return await request('/centers');
  },

  getCenterById: async (id) => {
    return await request(`/centers/${id}`);
  },

  getAvailability: async (centerId, date) => {
    return await request(`/availability?centerId=${centerId}&date=${date}`);
  },

  // 예약 관련
  getBookings: async () => {
    return await request('/bookings');
  },

  getBookingById: async (id) => {
    return await request(`/bookings/${id}`);
  },

  createBooking: async (bookingData) => {
    return await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  deleteBooking: async (id) => {
    return await request(`/bookings/${id}`, {
      method: 'DELETE'
    });
  },

  // 점검 리포트 관련
  getReports: async () => {
    return await request('/reports');
  },

  getReportById: async (id) => {
    return await request(`/reports/${id}`);
  },

  uploadDocument: async (reportId, documentData) => {
    return await request(`/reports/${reportId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  },

  // 관심 차량 관련
  getFavorites: async () => {
    return await request('/favorites');
  },

  addFavorite: async (vehicleId) => {
    return await request(`/favorites/${vehicleId}`, {
      method: 'POST'
    });
  },

  removeFavorite: async (vehicleId) => {
    return await request(`/favorites/${vehicleId}`, {
      method: 'DELETE'
    });
  }
};
