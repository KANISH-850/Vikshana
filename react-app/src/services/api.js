import axios from 'axios';

// The Catalyst CLI serves backend and proxies it under /server/ automatically
export const API_BASE_URL = '/server/vikshana_function';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 60000 // 60 second timeout — AI responses can take 20–30s
});

export default api;
