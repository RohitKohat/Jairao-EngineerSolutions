import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaBoxOpen, FaTrash, FaCheckSquare, FaSquare,
  FaEdit, FaPlus, FaSave, FaTimes,
} from 'react-icons/fa';

const url = 'http://localhost:3000';

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [editedDiscount, setEditedDiscount] = useState('');
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const response = await axios.get(`${url}/api/food/user-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        toast.error('Error fetching the product list.');
      }
    } catch (error) {
      console.error('Error fetching the list:', error);
      // Fallback demo products
      setProducts([
        { _id: 'p1', name: 'Samsung 1.5 Ton AC', category: 'AC', image: '', price: 45000, discount: 10, finalPrice: 40500 },
        { _id: 'p2', name: 'LG Washing Machine', category: 'Washing Machine', image: '', price: 32000, discount: 5, finalPrice: 30400 },
        { _id: 'p3', name: 'Godrej Refrigerator', category: 'Refrigerator', image: '', price: 28000, discount: 0, finalPrice: 28000 },
      ]);
    }
  };

  const removeFood = async (foodId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error('Error removing the product.');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('An error occurred.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products to delete.');
      return;
    }
    if (!window.confirm(`Delete ${selectedProducts.length} product(s)?`)) return;

    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      for (const id of selectedProducts) {
        await axios.post(
          `${url}/api/food/remove`,
          { id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success('Selected products deleted successfully!');
      setSelectedProducts([]);
      fetchList();
    } catch (error) {
      console.error('Error deleting selected products:', error);
      toast.error('An error occurred.');
    }
  };

  const updatePriceAndDiscount = async (id) => {
    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const response = await axios.post(
        `${url}/api/food/update-price`,
        {
          id,
          price: Number(editedPrice),
          discount: Number(editedDiscount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setEditMode(null);
        fetchList();
      } else {
        toast.error('Error updating price and discount.');
      }
    } catch (error) {
      console.error('Error updating price and discount:', error);
      toast.error('An error occurred.');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p._id));
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="product-page">
      <div className="page-header">
        <h1>My Products</h1>
        <p>Manage your product catalog, pricing, and inventory</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaBoxOpen className="table-title-icon" />
            <h2>All Products ({products.length})</h2>
          </div>
          <div className="table-header-actions">
            <button className="btn-secondary-action" onClick={handleDeleteSelected}>
              <FaTrash /> Delete Selected ({selectedProducts.length})
            </button>
            <button className="btn-primary-action" onClick={() => navigate('/addnew')}>
              <FaPlus /> Add New Product
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <span
                    onClick={handleSelectAll}
                    style={{ cursor: 'pointer', color: 'var(--primary)' }}
                  >
                    {selectedProducts.length === products.length && products.length > 0
                      ? <FaCheckSquare />
                      : <FaSquare />}
                  </span>
                </th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Final Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleCheckboxChange(product._id)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </td>
                    <td>
                      {product.image ? (
                        <img
                          src={`${url}/uploads/${product.image}`}
                          alt={product.name}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-thumb product-thumb-placeholder">
                          <FaBoxOpen />
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">{product.name}</td>
                    <td>
                      <span className="category-chip">{product.category}</span>
                    </td>
                    <td>
                      {editMode === product._id ? (
                        <input
                          type="number"
                          value={editedPrice}
                          onChange={(e) => setEditedPrice(e.target.value)}
                          className="inline-input"
                        />
                      ) : (
                        formatCurrency(product.price)
                      )}
                    </td>
                    <td>
                      {editMode === product._id ? (
                        <input
                          type="number"
                          value={editedDiscount}
                          onChange={(e) => setEditedDiscount(e.target.value)}
                          className="inline-input"
                        />
                      ) : (
                        `${product.discount || 0}%`
                      )}
                    </td>
                    <td className="text-green font-bold">
                      {formatCurrency(product.finalPrice || (product.price - (product.price * (product.discount || 0)) / 100))}
                    </td>
                    <td>
                      <div className="product-actions">
                        {editMode === product._id ? (
                          <>
                            <button
                              className="btn-icon btn-icon-success"
                              onClick={() => updatePriceAndDiscount(product._id)}
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              className="btn-icon btn-icon-muted"
                              onClick={() => setEditMode(null)}
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-icon btn-icon-primary"
                              onClick={() => {
                                setEditMode(product._id);
                                setEditedPrice(product.price);
                                setEditedDiscount(product.discount || 0);
                              }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => removeFood(product._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;