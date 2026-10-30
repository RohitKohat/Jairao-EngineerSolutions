import api from './client';

// ═══ Service Catalog (public) ═══
export const getServiceCatalog = async (category = null) => {
  const params = category ? { category } : {};
  const { data } = await api.get('/api/services/catalog', { params });
  return data;
};

// ═══ Service Requests (customer) ═══
export const createServiceRequest = async (payload) => {
  const { data } = await api.post('/api/services/requests', payload);
  return data;
};

export const getMyServiceRequests = async () => {
  const { data } = await api.get('/api/services/requests/my');
  return data.requests || [];
};

export const getServiceRequestById = async (id) => {
  const { data } = await api.get(`/api/services/requests/${id}`);
  return data;
};