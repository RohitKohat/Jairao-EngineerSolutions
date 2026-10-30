import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaStore, FaEnvelope, FaLock } from 'react-icons/fa';

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
      const response = await fetch('http://localhost:3000/api/vendor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('vendorToken', data.token);
        localStorage.setItem('token', data.token); // backward compat
        localStorage.setItem('vendorUser', JSON.stringify(data.user || { email: formData.email, name: 'Vendor', company: 'Store' }));
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // ✅ Fallback demo login (remove when backend is ready)
      localStorage.setItem('vendorToken', 'demo-token');
      localStorage.setItem('vendorUser', JSON.stringify({ name: 'Demo Vendor', email: formData.email, company: 'TechStore' }));
      toast.success('Logged in (demo mode)');
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
          <h2>Vendor Login</h2>
          <p>Access your store dashboard and manage products</p>
        </div>

        <div className="auth-field">
          <label>Email Address</label>
          <div className="input-wrap">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
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
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-switch">
          New vendor? <Link to="/registeraccount">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;