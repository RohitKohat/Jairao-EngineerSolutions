import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaBoxOpen, FaPlus, FaArrowLeft } from 'react-icons/fa';

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'AC',
    brand: '',
    finalPrice: '',
  });

  useEffect(() => {
    const { price, discount } = productData;
    if (price && discount) {
      const finalPrice = price - (price * discount) / 100;
      setProductData((prev) => ({ ...prev, finalPrice: finalPrice.toFixed(2) }));
    } else if (price) {
      setProductData((prev) => ({ ...prev, finalPrice: Number(price).toFixed(2) }));
    } else {
      setProductData((prev) => ({ ...prev, finalPrice: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData.price, productData.discount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const processImage = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImageError('');
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewImage(null);
      setImageError('Please upload a valid image file.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    processImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!image) {
      setImageError('Please upload an image.');
      toast.error('Product image is required');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', Number(productData.price));
    formData.append('discount', Number(productData.discount || 0));
    formData.append('category', productData.category);
    formData.append('brand', productData.brand);
    formData.append('finalPrice', Number(productData.finalPrice));
    formData.append('image', image);

    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/food/add',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setProductData({
          name: '', description: '', price: '', discount: '',
          category: 'AC', brand: '', finalPrice: '',
        });
        setImage(null);
        setPreviewImage(null);
        setTimeout(() => navigate('/product-add'), 800);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate('/product-add')}
          className="btn-icon btn-icon-muted"
          style={{ padding: 10 }}
        >
          <FaArrowLeft />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="page-header-icon">
            <FaBoxOpen />
          </div>
          <div>
            <h1>Add New Product</h1>
            <p>Fill in the details below to add a new product to your catalog</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="product-form">
          {/* Top Row: Image + Name/Desc */}
          <div className="form-top-row">
            <div className="form-img-upload">
              <label className="form-section-label">Product Image</label>
              <div
                className={`upload-box ${isDragging ? 'dragging' : ''} ${previewImage ? 'has-image' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className="preview-img" />
                    <span className="change-hint">Click to change</span>
                  </>
                ) : (
                  <div className="upload-placeholder">
                    <FaCloudUploadAlt className="upload-icon" />
                    <span className="upload-title">Drag & drop an image here</span>
                    <span className="upload-subtitle">or click to browse</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              {imageError && <p className="form-error">{imageError}</p>}
            </div>

            <div className="form-fields-col">
              <div className="form-field">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Samsung 1.5 Ton Split AC"
                  value={productData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field form-field-grow">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  placeholder="Describe the product features, warranty, etc."
                  value={productData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Category + Brand + Price + Discount + Final */}
          <div className="form-grid-3">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={productData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {['AC', 'Washing Machine', 'Refrigerator', 'Water Purifier', 'Deep Freezer', 'TV', 'Air Cooler'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="brand">Brand</label>
              <select
                id="brand"
                name="brand"
                value={productData.brand}
                onChange={handleChange}
                required
              >
                <option value="">Select brand</option>
                {['Haier', 'Godrej', 'LG', 'Samsung', 'Voltas', 'Blue Star', 'Whirlpool', 'Panasonic'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="price">Price (₹)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                placeholder="0"
                value={productData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                name="discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={productData.discount}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="finalPrice">Final Price (₹)</label>
              <input
                id="finalPrice"
                name="finalPrice"
                type="text"
                readOnly
                value={productData.finalPrice}
                className="form-input-readonly"
              />
            </div>
          </div>

          <div className="form-submit-row">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={() => navigate('/product-add')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              disabled={isSubmitting}
            >
              <FaPlus /> {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;