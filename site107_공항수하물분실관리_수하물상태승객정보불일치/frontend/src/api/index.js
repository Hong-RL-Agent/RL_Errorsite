const BASE_URL = 'http://localhost:9606/api';

export const fetchStaffs = async () => {
  const res = await fetch(`${BASE_URL}/staffs`);
  return res.json();
};

export const fetchFlights = async () => {
  const res = await fetch(`${BASE_URL}/flights`);
  return res.json();
};

export const fetchPassengers = async () => {
  const res = await fetch(`${BASE_URL}/passengers`);
  return res.json();
};

export const fetchBaggage = async () => {
  const res = await fetch(`${BASE_URL}/baggage`);
  return res.json();
};

export const fetchLostClaims = async () => {
  const res = await fetch(`${BASE_URL}/lost-claims`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchBaggageApi = async (flightNo, status, search) => {
  const res = await fetch(`${BASE_URL}/baggage/search?flightNo=${flightNo}&status=${status}&search=${search}`);
  return res.json();
};

export const patchBaggageStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/baggage/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchBaggageHandlerApi = async (id, handlerName) => {
  const res = await fetch(`${BASE_URL}/baggage/${id}/handler`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handlerName })
  });
  return res.json();
};

export const cancelLostClaimApi = async (id) => {
  const res = await fetch(`${BASE_URL}/lost-claims/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const updateBaggageLocationApi = async (id, location) => {
  const res = await fetch(`${BASE_URL}/baggage/${id}/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });
  return res.json();
};

export const closeClaimUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/lost-claims/${id}/close-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchPassengerPartialApi = async (id, phone, deliveryAddress, requests) => {
  const res = await fetch(`${BASE_URL}/passengers/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, deliveryAddress, requests })
  });
  return res.json();
};

export const deleteProcessingLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/processing-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
