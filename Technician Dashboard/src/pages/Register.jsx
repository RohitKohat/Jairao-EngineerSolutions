import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTools, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Reusing Login CSS

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  
  // ✅ Correctly grabbing 'register' from useAuth
  const { register } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Pass the whole object to register
    const result = await register(formData);
    
    setLoading(false);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-box" onSubmit={handleSubmit}>
        <div className="auth-header">
          <div className="auth-icon"><FaTools /></div>
          <h2>Technician Sign Up</h2>
          <p>Join our network of expert professionals</p>
        </div>

        <div className="auth-field">
          <label>Full Name</label>
          <div className="input-wrap">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Email</label>
          <div className="input-wrap">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
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
              type="tel"
              name="phone"
              placeholder="+91 9876543210"
              value={formData.phone}
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
              type="password"
              name="password"
              placeholder="Min 6 characters"
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;