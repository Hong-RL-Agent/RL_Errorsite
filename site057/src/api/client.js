// RideOn Mobility Frontend API Client

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `요청 실패 (상태: ${response.status})`);
  }

  if (response.status === 204) return null;
  return await response.json();
}

export const api = {
  // 차량 관련
  getVehicles: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.type && params.type !== 'all') q.set('type', params.type);
    if (params.batteryMin) q.set('batteryMin', params.batteryMin);
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.sort) q.set('sort', params.sort);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return await request(`/vehicles${queryStr}`);
  },

  getVehicleById: async (id) => {
    return await request(`/vehicles/${id}`);
  },

  getVehicleAvailability: async (id) => {
    return await request(`/vehicles/${id}/availability`);
  },

  // 스테이션 관련
  getStations: async () => {
    return await request('/stations');
  },

  getStationById: async (id) => {
    return await request(`/stations/${id}`);
  },

  // 대여 관련
  getRentals: async () => {
    return await request('/rentals');
  },

  getRentalById: async (id) => {
    return await request(`/rentals/${id}`);
  },

  getRentalFare: async (id) => {
    return await request(`/rentals/${id}/fare`);
  },

  createRental: async (vehicleId) => {
    return await request('/rentals', {
      method: 'POST',
      body: JSON.stringify({ vehicleId })
    });
  },

  startRental: async (id) => {
    return await request(`/rentals/${id}/start`, {
      method: 'POST'
    });
  },

  finishRental: async (id, endStation = '') => {
    return await request(`/rentals/${id}/finish`, {
      method: 'POST',
      body: JSON.stringify({ endStation })
    });
  },

  // 이용 기록
  getRideHistory: async () => {
    return await request('/rides/history');
  },

  // 계정
  getAccount: async () => {
    return await request('/account');
  },

  updateAccount: async (data) => {
    return await request('/account', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};
