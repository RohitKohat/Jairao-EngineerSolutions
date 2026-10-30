import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTools, FaEnvelope, FaLock } from 'react-icons/fa';
import api from '../api/api';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', formData);

      if (data.user.role !== 'ADMIN') {
        toast.error('This portal is for admins only');
        setLoading(false);
        return;
      }

      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('authToken', data.access_token); // backward compat
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="login-icon"><FaTools /></div>
          <h2>Admin Login</h2>
          <p>Access the platform administration panel</p>
        </div>

        <div className="login-field">
          <label>Email</label>
          <div className="input-wrap">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="login-field">
          <label>Password</label>
          <div className="input-wrap">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;