import axios from 'axios';

const api = axios.create({
    baseURL: "/api", // Matches your backend port
});

if(!import.meta.env.VITE_API_URL) console.error("VITE_API_URL is not defined.")
// Add token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;