import axios from 'axios';

declare global {
  interface Window {
    __env__?: { API_URL?: string };
  }
}

const apiClient = axios.create({
  // In dev, use an empty baseURL so all /api/* requests go through Vite's proxy to localhost:8000.
  // In production, fall back to the configured API URL.
  baseURL: import.meta.env.DEV
    ? ''
    : (window.__env__?.API_URL ?? import.meta.env.VITE_API_URL ?? 'https://vigilant-api.duckdns.org'),
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
