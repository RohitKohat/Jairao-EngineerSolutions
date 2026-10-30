import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import api from '../../api/client';
import './SolarForm.css';

const SolarForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedCapacity = location.state?.capacity || 'Solar System';
  const selectedSubsidy = location.state?.subsidy;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/quotations', {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        capacity: selectedCapacity,
        message: `Requested quote for ${selectedCapacity} Solar System`,
      });

      toast.success('Quote request submitted successfully!');
      navigate('/'); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="solar-form-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Plans
      </button>

      <div className="solar-form-container">
        <h2>Contact Details</h2>
        <p className="subtitle">
          You are requesting a quote for <strong>{selectedCapacity}</strong>
          {selectedSubsidy && ` (Subsidy: ₹${selectedSubsidy})`}
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              placeholder="Enter your address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SolarForm;