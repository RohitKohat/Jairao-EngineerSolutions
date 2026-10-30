import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaBoxOpen, FaPlus } from 'react-icons/fa';
import api from '../../api/api';
import './Add.css';

const Add = () => {
  const [image, setImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'Air-Conditioner',
    brand: '',
    stock: '',
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
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
      setImage(e.dataTransfer.files[0]);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error('Please upload a product image.');
      return;
    }

    if (!data.name || !data.price) {
      toast.error('Name and price are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // ═══ STEP 1: Upload image ═══
      const formData = new FormData();
      formData.append('file', image);

      // ⚠️ Don't set Content-Type manually — axios auto-detects FormData
      const uploadRes = await api.post('/api/products/upload', formData);
      const imageUrl = uploadRes.data.url;

      // ═══ STEP 2: Create product ═══
      const price = Number(data.price);
      const discount = Number(data.discount) || 0;
      const finalPrice = Math.round((price - (price * discount) / 100) * 100) / 100;

      const productRes = await api.post('/api/products', {
        name: data.name,
        description: data.description || '',
        price,
        discount,
        final_price: finalPrice,
        category: data.category,
        brand: data.brand || null,
        stock: Number(data.stock) || 0,
        image: imageUrl,
      });

      if (productRes.data.id) {
        toast.success('Product added successfully!');
        // Reset form
        setData({
          name: '',
          description: '',
          price: '',
          discount: '',
          category: 'Air-Conditioner',
          brand: '',
          stock: '',
        });
        setImage(false);
      }
    } catch (error) {
      console.error('Add product error:', error);
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'An error occurred while adding the product.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add">
      <div className="add-header">
        <div className="add-header-icon">
          <FaBoxOpen />
        </div>
        <div>
          <h2>Add New Product</h2>
          <p>Fill in the details below to add a new product to the catalog</p>
        </div>
      </div>

      <div className="add-card">
        <form onSubmit={onSubmitHandler}>
          <div className="add-top-row">
            <div className="add-img-upload">
              <p>Product Image</p>
              <label
                htmlFor="image"
                className={`upload-box ${isDragging ? 'dragging' : ''} ${
                  image ? 'has-image' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {image ? (
                  <>
                    <img
                      className="preview-img"
                      src={URL.createObjectURL(image)}
                      alt="Product preview"
                    />
                    <span className="change-image-hint">
                      Click to change image
                    </span>
                  </>
                ) : (
                  <div className="upload-placeholder">
                    <FaCloudUploadAlt className="upload-icon" />
                    <span className="upload-title">
                      Drag &amp; drop an image here
                    </span>
                    <span className="upload-subtitle">or click to browse</span>
                  </div>
                )}
              </label>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="image"
                accept="image/*"
                hidden
              />
            </div>

            <div className="add-right-col">
              <div className="add-field">
                <label htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  name="name"
                  placeholder="e.g., Samsung 1.5 Ton Split AC"
                  required
                />
              </div>

              <div className="add-field add-field-grow">
                <label htmlFor="product-desc">Product Description</label>
                <textarea
                  id="product-desc"
                  onChange={onChangeHandler}
                  value={data.description}
                  name="description"
                  rows="6"
                  placeholder="Describe the product features, warranty, etc."
                />
              </div>
            </div>
          </div>

          <div className="add-category-price">
            <div className="add-field">
              <label htmlFor="product-category">Category *</label>
              <select
                id="product-category"
                onChange={onChangeHandler}
                name="category"
                value={data.category}
              >
                <option value="Air-Conditioner">Air-Conditioner</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="Deep Freezer">Deep Freezer</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Geyser">Geyser</option>
                <option value="Air Cooler">Air Cooler</option>
                <option value="Water Purifier">Water Purifier</option>
                <option value="TV">TV</option>
              </select>
            </div>

            <div className="add-field">
              <label htmlFor="product-brand">Brand</label>
              <select
                id="product-brand"
                onChange={onChangeHandler}
                name="brand"
                value={data.brand}
              >
                <option value="">Select Brand</option>
                <option value="Godrej">Godrej</option>
                <option value="LG">LG</option>
                <option value="Whirlpool">Whirlpool</option>
                <option value="Haier">Haier</option>
                <option value="Panasonic">Panasonic</option>
                <option value="Aquaguard">Aquaguard</option>
                <option value="Kent">Kent</option>
                <option value="Voltas">Voltas</option>
                <option value="Blue Star">Blue Star</option>
                <option value="Samsung">Samsung</option>
                <option value="Mi">Mi</option>
              </select>
            </div>

            <div className="add-field">
              <label htmlFor="product-price">Price (₹) *</label>
              <input
                id="product-price"
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="add-field">
              <label htmlFor="product-discount">Discount (%)</label>
              <input
                id="product-discount"
                onChange={onChangeHandler}
                value={data.discount}
                type="number"
                name="discount"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            <div className="add-field">
              <label htmlFor="product-stock">Stock</label>
              <input
                id="product-stock"
                onChange={onChangeHandler}
                value={data.stock}
                type="number"
                name="stock"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="add-btn"
            disabled={isSubmitting}
          >
            <FaPlus className="add-btn-icon" />
            {isSubmitting ? 'ADDING...' : 'ADD PRODUCT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;