import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    // Using a very aggressive timeout for Defect 3 if configured by client
    timeout: 30000, 
});

// We can expose functions that map to our defects
export const fetchTrafficData = async (simulateTimeout: boolean = false, regionFailover: boolean = false) => {
    // If simulateTimeout is true, we might also drop the client timeout to 1s to guarantee failure (Defect 3)
    const config = simulateTimeout ? { timeout: 1000 } : {};
    
    const headers = regionFailover ? { 'X-Region-Failover': 'true' } : {};
    
    return apiClient.get('/traffic/data', {
        ...config,
        headers,
        params: { simulate_timeout: simulateTimeout }
    });
};

export const exportDataCSV = async () => {
    return apiClient.get('/export');
};

export const fetchLogs = async (dateStr?: string) => {
    return apiClient.get('/logs', { params: { date: dateStr } });
};
