import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // ⚠️ Don't set Content-Type manually — axios auto-detects
});

// ═══ Request Interceptor: Auto-attach token ═══
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('customerToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('vendorToken') ||
      localStorage.getItem('adminToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══ Response Interceptor: Handle 401 ═══
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout only if accessing protected route
    if (error.response?.status === 401) {
      const publicPaths = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;