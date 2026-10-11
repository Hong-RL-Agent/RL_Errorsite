import { request, qs } from './client.js';

export const getHealth = () => request('/api/health');
export const getDepartments = () => request('/api/departments');
export const getRegions = () => request('/api/regions');
export const getHospitals = (params) => request(`/api/hospitals${qs(params)}`);
export const getHospital = (id) => request(`/api/hospitals/${id}`);
export const getDoctorSchedule = (id) => request(`/api/doctors/${id}/schedule`);
export const getAvailability = (params) => request(`/api/availability${qs(params)}`);
export const getPatient = (id) => request(`/api/patients/${id}`);

export const listAppointments = (params) => request(`/api/appointments${qs(params)}`);
export const getAppointment = (id) => request(`/api/appointments/${id}`);
export const createAppointment = (body) => request('/api/appointments', { method: 'POST', body });
export const updateAppointment = (id, body) => request(`/api/appointments/${id}`, { method: 'PATCH', body });
export const cancelAppointment = (id, reason) => request(`/api/appointments/${id}/cancel`, { method: 'POST', body: { reason } });
export const confirmAppointment = (id) => request(`/api/appointments/${id}/confirm`, { method: 'POST', body: {} });

export const listNotifications = (params) => request(`/api/notifications${qs(params)}`);
export const markNotificationRead = (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH', body: {} });
export const listActivity = (params) => request(`/api/activity${qs(params)}`);
export const resetTestData = () => request('/api/test/reset', { method: 'POST', body: {} });
