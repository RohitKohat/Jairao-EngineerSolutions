import api from './client';

// ═══ Create order (customer) ═══
export const createOrder = async (orderData) => {
  const { data } = await api.post('/api/orders', orderData);
  return data;
};

// ═══ Get my orders (customer) ═══
export const getMyOrders = async () => {
  const { data } = await api.get('/api/orders/my-orders');
  return data.orders || [];
};

// ═══ Get single order ═══
export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/api/orders/${orderId}`);
  return data;
};

// ═══ Download invoice PDF ═══
export const downloadInvoice = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });
  return response.data;
};