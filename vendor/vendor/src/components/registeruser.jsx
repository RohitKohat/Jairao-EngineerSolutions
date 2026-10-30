import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStore, FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/vendorUser/vendor',
        formData
      );
      toast.success(response.data.message || 'Registration successful!');
      localStorage.setItem('vendorUser', JSON.stringify(formData));
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      // Fallback demo registration
      localStorage.setItem('vendorUser', JSON.stringify(formData));
      toast.success('Registered (demo mode)');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-box" onSubmit={handleSubmit}>
        <div className="auth-header">
          <div className="auth-icon"><FaStore /></div>
          <h2>Vendor Sign Up</h2>
          <p>Join the platform and start selling</p>
        </div>

        <div className="auth-field">
          <label>Full Name</label>
          <div className="input-wrap">
            <FaUser className="input-icon" />
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Email Address</label>
          <div className="input-wrap">
            <FaEnvelope className="input-icon" />
            <input
              name="email"
              type="email"
              placeholder="vendor@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Password</label>
          <div className="input-wrap">
            <FaLock className="input-icon" />
            <input
              name="password"
              type="password"
              placeholder="Min 6 characters"
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Phone Number</label>
          <div className="input-wrap">
            <FaPhone className="input-icon" />
            <input
              name="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;