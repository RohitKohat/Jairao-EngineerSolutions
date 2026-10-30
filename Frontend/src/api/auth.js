import api from './client';

// ═══ Register new customer ═══
export const registerCustomer = async ({ email, password, name, phone, address }) => {
  const { data } = await api.post('/api/auth/register', {
    email,
    password,
    name,
    phone: phone || null,
    role: 'CUSTOMER',
    address: address || null,
  });
  return data;
};

// ═══ Login ═══
export const loginCustomer = async ({ email, password }) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

// ═══ Save auth to localStorage ═══
export const saveAuth = (authData) => {
  if (authData.access_token) {
    localStorage.setItem('customerToken', authData.access_token);
    localStorage.setItem('token', authData.access_token); // backward compat
  }
  if (authData.user) {
    localStorage.setItem('customerUser', JSON.stringify(authData.user));
  }
};

// ═══ Clear auth ═══
export const clearAuth = () => {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('customerUser');
  localStorage.removeItem('token');
};

// ═══ Get stored user ═══
export const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('customerUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};