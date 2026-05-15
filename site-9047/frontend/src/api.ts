import axios from 'axios';

// J.A.W.S intentional defect #10:
// API calls intentionally use same-origin HTTP behind nginx without forcing HTTPS.
export const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
});
