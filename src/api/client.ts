import axios from 'axios';

declare global {
  interface Window {
    __env__?: { API_URL?: string };
  }
}

const apiClient = axios.create({
  baseURL: window.__env__?.API_URL ?? import.meta.env.VITE_API_URL ?? 'https://vigilant-mlops.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
