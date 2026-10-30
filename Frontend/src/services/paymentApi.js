import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Auto-inject customer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ═══ ORDER APIs ═══
export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my-orders');
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
};

export const downloadInvoice = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });
  return response.data;
};

// ═══ RAZORPAY ═══
export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post('/payments/razorpay/create-order', {
    order_id: orderId,
  });
  return data;
};

export const verifyRazorpayPayment = async (payload) => {
  const { data } = await api.post('/payments/razorpay/verify', payload);
  return data;
};

// ═══ COD ═══
export const createCODPayment = async (orderId, notes = '') => {
  const { data } = await api.post('/payments/cod', {
    order_id: orderId,
    notes,
  });
  return data;
};

// ═══ FINANCE / EMI ═══
export const createFinancePayment = async (orderId, provider, tenure, notes = '') => {
  const { data } = await api.post('/payments/finance', {
    order_id: orderId,
    finance_provider: provider,
    emi_tenure_months: tenure,
    notes,
  });
  return data;
};

export default api;