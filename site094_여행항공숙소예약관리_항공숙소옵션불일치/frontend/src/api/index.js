const BASE_URL = 'http://localhost:9593/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const fetchDestinations = async () => {
  const res = await fetch(`${BASE_URL}/destinations`);
  return res.json();
};

export const fetchFlights = async () => {
  const res = await fetch(`${BASE_URL}/flights`);
  return res.json();
};

export const fetchHotels = async () => {
  const res = await fetch(`${BASE_URL}/hotels`);
  return res.json();
};

export const fetchOptions = async () => {
  const res = await fetch(`${BASE_URL}/options`);
  return res.json();
};

export const fetchBookings = async () => {
  const res = await fetch(`${BASE_URL}/bookings`);
  return res.json();
};

export const searchFlightsApi = async (destination) => {
  const res = await fetch(`${BASE_URL}/flights/search?destination=${destination}`);
  return res.json();
};

export const patchBookingHotelApi = async (id, hotelId, hotelInfo) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/hotel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotelId, hotelInfo })
  });
  return res.json();
};

export const patchBookingFlightApi = async (id, flightId, flightInfo) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/flight`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightId, flightInfo })
  });
  return res.json();
};

export const cancelBookingApi = async (id) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const addBookingOptionApi = async (id, optionId) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/add-option`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId })
  });
  return res.json();
};

export const confirmBookingApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/confirm`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchTravelerPartialApi = async (id, passportName, phone, specialRequest) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/traveler`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passportName, phone, specialRequest })
  });
  return res.json();
};

export const deleteBookingOptionApi = async (id, optionId) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/options/${optionId}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
