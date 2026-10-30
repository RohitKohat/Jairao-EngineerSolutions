import api from './client';

// ═══ RAZORPAY ═══
export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post('/api/payments/razorpay/create-order', {
    order_id: orderId,
  });
  return data;
};

export const verifyRazorpayPayment = async (payload) => {
  const { data } = await api.post('/api/payments/razorpay/verify', payload);
  return data;
};

// ═══ CASH ON DELIVERY ═══
export const createCODPayment = async (orderId, notes = '') => {
  const { data } = await api.post('/api/payments/cod', {
    order_id: orderId,
    notes,
  });
  return data;
};

// ═══ FINANCE / EMI ═══
export const createFinancePayment = async (orderId, provider, tenure, notes = '') => {
  const { data } = await api.post('/api/payments/finance', {
    order_id: orderId,
    finance_provider: provider,
    emi_tenure_months: tenure,
    notes,
  });
  return data;
};