const BASE_URL = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getDepartments() {
    const res = await fetch(`${BASE_URL}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  async getHospitals(filters = {}) {
    const params = new URLSearchParams();
    if (filters.area && filters.area !== 'all') params.append('area', filters.area);
    if (filters.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);

    // If multiple departments selected as an array, joins as comma-separated string
    // Triggers SEC-474 on backend (server expects array or bracket format, mismatching comma string)
    if (filters.departments && filters.departments.length > 0) {
      params.append('departments', filters.departments.join(','));
    }

    const res = await fetch(`${BASE_URL}/hospitals?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch hospitals');
    return res.json();
  },

  async getHospitalById(id) {
    const res = await fetch(`${BASE_URL}/hospitals/${id}`);
    if (!res.ok) throw new Error('Failed to fetch hospital details');
    return res.json();
  },

  async getDoctors(filters = {}) {
    const params = new URLSearchParams();
    if (filters.hospitalId) params.append('hospitalId', filters.hospitalId);
    if (filters.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);
    
    // Pass minExperience (e.g. 0)
    if (filters.minExperience !== undefined && filters.minExperience !== null && filters.minExperience !== '') {
      params.append('minExperience', filters.minExperience);
    }

    const res = await fetch(`${BASE_URL}/doctors?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  async getDoctorById(id) {
    const res = await fetch(`${BASE_URL}/doctors/${id}`);
    if (!res.ok) throw new Error('Failed to fetch doctor details');
    return res.json();
  },

  async getDoctorAvailability(id) {
    const res = await fetch(`${BASE_URL}/doctors/${id}/availability`);
    if (!res.ok) throw new Error('Failed to fetch doctor availability');
    return res.json();
  },

  async getAppointments() {
    const res = await fetch(`${BASE_URL}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async getAppointmentById(id) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch appointment details');
    return res.json();
  },

  async createAppointment(data) {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create appointment');
    }
    return res.json();
  },

  async updateAppointment(id, data) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update appointment');
    return res.json();
  },

  async cancelAppointment(id) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  },

  async getNotices() {
    const res = await fetch(`${BASE_URL}/notices`);
    if (!res.ok) throw new Error('Failed to fetch notices');
    return res.json();
  }
};
