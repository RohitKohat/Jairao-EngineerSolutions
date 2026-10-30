import api from './client';

// ═══ List all products (public) ═══
export const getProducts = async ({ page = 1, limit = 100, category, brand, search } = {}) => {
  const params = { page, limit };
  if (category && category !== 'all') params.category = category;
  if (brand && brand !== 'all') params.brand = brand;
  if (search) params.search = search;

  const { data } = await api.get('/api/products', { params });
  return data.products || [];
};

// ═══ Get single product ═══
export const getProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};

// ═══ Create product (vendor/admin) ═══
export const createProduct = async (productData) => {
  const { data } = await api.post('/api/products', productData);
  return data;
};

// ═══ Upload product image ═══
export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/api/products/upload', formData);
  return data.url;
};