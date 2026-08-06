const BASE_URL = 'http://localhost:9608/api';

export const fetchStaffs = async () => {
  const res = await fetch(`${BASE_URL}/staffs`);
  return res.json();
};

export const fetchStudents = async () => {
  const res = await fetch(`${BASE_URL}/students`);
  return res.json();
};

export const fetchRooms = async () => {
  const res = await fetch(`${BASE_URL}/rooms`);
  return res.json();
};

export const fetchApplications = async () => {
  const res = await fetch(`${BASE_URL}/applications`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchStudentsApi = async (dormBuilding, status, search) => {
  const res = await fetch(`${BASE_URL}/students/search?dormBuilding=${dormBuilding}&status=${status}&search=${search}`);
  return res.json();
};

export const patchStudentRoomApi = async (id, roomNo) => {
  const res = await fetch(`${BASE_URL}/students/${id}/room`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomNo })
  });
  return res.json();
};

export const patchStudentStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/students/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const checkoutStudentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/students/${id}/checkout`, { method: 'POST' });
  return res.json();
};

export const updateRoomOccupancyApi = async (id) => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/occupancy`, { method: 'POST' });
  return res.json();
};

export const forceChangeRoomUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/force-change-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchStudentPartialApi = async (id, phone, parentPhone, preferredRoommate) => {
  const res = await fetch(`${BASE_URL}/students/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, parentPhone, preferredRoommate })
  });
  return res.json();
};

export const approveApplicationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/applications/${id}/approve`, { method: 'POST' });
  return res.json();
};

export const deleteAllocationLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/allocation-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
