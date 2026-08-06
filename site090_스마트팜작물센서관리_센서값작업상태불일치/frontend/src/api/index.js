const BASE_URL = 'http://localhost:9589/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchZones = async () => {
  const res = await fetch(`${BASE_URL}/zones`);
  return res.json();
};

export const fetchCrops = async () => {
  const res = await fetch(`${BASE_URL}/crops`);
  return res.json();
};

export const fetchSensors = async () => {
  const res = await fetch(`${BASE_URL}/sensors`);
  return res.json();
};

export const fetchWorkLogs = async () => {
  const res = await fetch(`${BASE_URL}/work-logs`);
  return res.json();
};

export const fetchAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`);
  return res.json();
};

export const searchSensorsApi = async (zoneId, type) => {
  const res = await fetch(`${BASE_URL}/sensors/search?zoneId=${zoneId}&type=${type}`);
  return res.json();
};

export const patchIrrigationVolumeApi = async (id, irrigationVolume, scheduledTime) => {
  const res = await fetch(`${BASE_URL}/crops/${id}/irrigation-volume`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ irrigationVolume, scheduledTime })
  });
  return res.json();
};

export const patchIrrigationTimeApi = async (id, scheduledTime) => {
  const res = await fetch(`${BASE_URL}/crops/${id}/irrigation-time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduledTime })
  });
  return res.json();
};

export const cancelWorkLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/work-logs/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const resolveAlertApi = async (id) => {
  const res = await fetch(`${BASE_URL}/alerts/${id}/resolve`, { method: 'POST' });
  return res.json();
};

export const irrigateCropApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/crops/${id}/irrigate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchCropPartialApi = async (id, cropName, growthStage, manager) => {
  const res = await fetch(`${BASE_URL}/crops/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cropName, growthStage, manager })
  });
  return res.json();
};

export const deleteAlertApi = async (id) => {
  const res = await fetch(`${BASE_URL}/alerts/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
