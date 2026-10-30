import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaBoxOpen, FaSearch, FaTrash, FaEdit, FaSave, FaTimes,
  FaCheckSquare, FaSquare, FaSync,
} from 'react-icons/fa';
import api from '../../api/api';
import './List.css';

const List = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [editedDiscount, setEditedDiscount] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/products?limit=100');
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const removeProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${productId}`);
      toast.success('Product deleted');
      fetchList();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products to delete');
      return;
    }
    if (!window.confirm(`Delete ${selectedProducts.length} product(s)?`)) return;

    try {
      await Promise.all(
        selectedProducts.map((id) => api.delete(`/api/products/${id}`))
      );
      toast.success('Selected products deleted');
      setSelectedProducts([]);
      fetchList();
    } catch (error) {
      toast.error('Failed to delete some products');
    }
  };

  const updatePriceAndDiscount = async (id) => {
    try {
      const product = products.find((p) => p.id === id);
      const newPrice = Number(editedPrice) || product.price;
      const newDiscount = Number(editedDiscount) || 0;
      const finalPrice = newPrice - (newPrice * newDiscount) / 100;

      await api.put(`/api/products/${id}`, {
        price: newPrice,
        discount: newDiscount,
        final_price: finalPrice,
      });
      toast.success('Product updated');
      setEditMode(null);
      fetchList();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Update failed');
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const toggleSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filtered.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filtered.map((p) => p.id));
    }
  };

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term) ||
      (p.brand || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="list-container">
      <div className="list-header">
        <div className="list-header-content">
          <h2>All Products</h2>
          <p>{filtered.length} of {products.length} products</p>
        </div>
        <div className="list-header-actions">
          <div className="list-search">
            <FaSearch className="list-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary-action" onClick={fetchList}>
            <FaSync /> Refresh
          </button>
          <button className="btn-danger-action" onClick={handleDeleteSelected}>
            <FaTrash /> Delete ({selectedProducts.length})
          </button>
        </div>
      </div>

      <div className="list-table-wrapper">
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
        ) : (
          <div className="list-table">
            <div className="list-table-format title">
              <b>
                <span onClick={toggleSelectAll} style={{ cursor: 'pointer', color: 'var(--primary)' }}>
                  {selectedProducts.length === filtered.length && filtered.length > 0
                    ? <FaCheckSquare />
                    : <FaSquare />}
                </span>
              </b>
              <b>Image</b>
              <b>Name</b>
              <b>Category</b>
              <b>Brand</b>
              <b>Price</b>
              <b>Discount</b>
              <b>Final Price</b>
              <b>Action</b>
            </div>

            {filtered.length === 0 ? (
              <div className="list-empty">No products found</div>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="list-table-format">
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                  </div>
                  <div>
                    {item.image ? (
                      <img
                        src={`http://localhost:8000${item.image}`}
                        alt={item.name}
                        className="product-thumb"
                      />
                    ) : (
                      <div className="product-thumb product-thumb-placeholder">
                        <FaBoxOpen />
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">{item.name}</p>
                  <p><span className="category-chip">{item.category}</span></p>
                  <p className="text-muted">{item.brand || '—'}</p>
                  <p>
                    {editMode === item.id ? (
                      <input
                        type="number"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(e.target.value)}
                        className="inline-input"
                      />
                    ) : (
                      formatCurrency(item.price)
                    )}
                  </p>
                  <p>
                    {editMode === item.id ? (
                      <input
                        type="number"
                        value={editedDiscount}
                        onChange={(e) => setEditedDiscount(e.target.value)}
                        className="inline-input"
                      />
                    ) : (
                      `${item.discount || 0}%`
                    )}
                  </p>
                  <p className="text-green font-bold">{formatCurrency(item.final_price)}</p>
                  <div className="action-buttons">
                    {editMode === item.id ? (
                      <>
                        <button className="btn-icon btn-icon-success" onClick={() => updatePriceAndDiscount(item.id)} title="Save">
                          <FaSave />
                        </button>
                        <button className="btn-icon btn-icon-muted" onClick={() => setEditMode(null)} title="Cancel">
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-icon btn-icon-primary"
                          onClick={() => {
                            setEditMode(item.id);
                            setEditedPrice(item.price);
                            setEditedDiscount(item.discount || 0);
                          }}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => removeProduct(item.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default List;