const BASE_URL = 'http://localhost:9607/api';

export const fetchStaffs = async () => {
  const res = await fetch(`${BASE_URL}/staffs`);
  return res.json();
};

export const fetchUnits = async () => {
  const res = await fetch(`${BASE_URL}/units`);
  return res.json();
};

export const fetchBills = async () => {
  const res = await fetch(`${BASE_URL}/bills`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchComplaints = async () => {
  const res = await fetch(`${BASE_URL}/complaints`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchReservationsApi = async (building, facilityType, search) => {
  const res = await fetch(`${BASE_URL}/reservations/search?building=${building}&facilityType=${facilityType}&search=${search}`);
  return res.json();
};

export const patchReservationTimeApi = async (id, resTime) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resTime })
  });
  return res.json();
};

export const patchReservationAttendeesApi = async (id, attendees) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/attendees`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attendees })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const updateBillPaymentStatusApi = async (id) => {
  const res = await fetch(`${BASE_URL}/bills/${id}/pay-status`, { method: 'POST' });
  return res.json();
};

export const markBillPaidUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/bills/${id}/pay-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchUnitPartialApi = async (id, phone, carNo, note) => {
  const res = await fetch(`${BASE_URL}/units/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, carNo, note })
  });
  return res.json();
};

export const deleteReservationLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservation-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
