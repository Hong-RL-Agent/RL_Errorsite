const BASE_URL = 'http://localhost:9587/api';

export const fetchNurses = async () => {
  const res = await fetch(`${BASE_URL}/nurses`);
  return res.json();
};

export const fetchRooms = async () => {
  const res = await fetch(`${BASE_URL}/rooms`);
  return res.json();
};

export const fetchPatients = async () => {
  const res = await fetch(`${BASE_URL}/patients`);
  return res.json();
};

export const fetchMedications = async () => {
  const res = await fetch(`${BASE_URL}/medications`);
  return res.json();
};

export const fetchRoomLogs = async () => {
  const res = await fetch(`${BASE_URL}/room-logs`);
  return res.json();
};

export const searchPatientsApi = async (ward, status) => {
  const res = await fetch(`${BASE_URL}/patients/search?ward=${ward}&status=${status}`);
  return res.json();
};

export const patchMedicationStatusApi = async (id, status, roomNo) => {
  const res = await fetch(`${BASE_URL}/medications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, roomNo })
  });
  return res.json();
};

export const patchPatientRoomApi = async (id, roomNo, ward, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/patients/${id}/room`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ roomNo, ward })
  });
  return res.json();
};

export const dischargePatientApi = async (id) => {
  const res = await fetch(`${BASE_URL}/patients/${id}/discharge`, { method: 'POST' });
  return res.json();
};

export const addMedicationRecordApi = async (patientId, patientName, roomNo, ward, medicineName, timeSlot, dose) => {
  const res = await fetch(`${BASE_URL}/medications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, patientName, roomNo, ward, medicineName, timeSlot, dose })
  });
  return res.json();
};

export const patchPatientMemoPartialApi = async (id, precautions, guardianPhone, nurseMemo) => {
  const res = await fetch(`${BASE_URL}/patients/${id}/memo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ precautions, guardianPhone, nurseMemo })
  });
  return res.json();
};

export const deleteMedicationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/medications/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
