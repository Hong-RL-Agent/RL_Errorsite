import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:9045/api',
  // 의도적 결함: 타임아웃 미설정 (9045-Network-2)
  // timeout: 5000, 
});