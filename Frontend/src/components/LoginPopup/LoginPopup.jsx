import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { authApi } from '../../api';
import { StoreContext } from '../../context/StoreContext';
import './LoginPopup.css';

const LoginPopup = ({ setShowLogin }) => {
  const { setToken } = useContext(StoreContext);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  // ═══ Handle Login ═══
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.loginCustomer(loginData);

      if (data.user?.role !== 'CUSTOMER') {
        setError('This login is for customers only');
        setLoading(false);
        return;
      }

      authApi.saveAuth(data);
      setToken(data.access_token);

      toast.success(`Welcome back, ${data.user.name}!`);
      setShowLogin(false);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ═══ Handle Signup ═══
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.registerCustomer(signupData);

      authApi.saveAuth(data);
      setToken(data.access_token);

      toast.success(`Welcome, ${data.user.name}!`);
      setShowLogin(false);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <div className="login-popup-overlay" onClick={() => setShowLogin(false)}>
      <div
        className="login-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="login-popup-close"
          onClick={() => setShowLogin(false)}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="login-popup-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to continue shopping'
              : 'Join us to start shopping and booking services'}
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="login-popup-error">{error}</div>}

        {/* ═══ LOGIN FORM ═══ */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="login-popup-form">
            <div className="lp-field">
              <label>Email</label>
              <div className="lp-input-wrap">
                <FaEnvelope className="lp-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Password</label>
              <div className="lp-input-wrap">
                <FaLock className="lp-input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* ═══ SIGNUP FORM ═══ */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="login-popup-form">
            <div className="lp-field">
              <label>Full Name</label>
              <div className="lp-input-wrap">
                <FaUser className="lp-input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Email</label>
              <div className="lp-input-wrap">
                <FaEnvelope className="lp-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Password</label>
              <div className="lp-input-wrap">
                <FaLock className="lp-input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  minLength={6}
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Phone</label>
              <div className="lp-input-wrap">
                <FaPhone className="lp-input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Address</label>
              <div className="lp-input-wrap">
                <FaMapMarkerAlt className="lp-input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="City, State"
                  value={signupData.address}
                  onChange={handleSignupChange}
                />
              </div>
            </div>

            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Switch Mode */}
        <div className="login-popup-switch">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" onClick={switchMode}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={switchMode}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;