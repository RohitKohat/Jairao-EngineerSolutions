/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('technicianToken');
    const storedUser = localStorage.getItem('technicianUser');
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.user?.role !== 'TECHNICIAN') {
        return { success: false, message: 'Access denied. This portal is for technicians only.' };
      }
      localStorage.setItem('technicianToken', data.access_token);
      localStorage.setItem('technicianUser', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.detail || 'Invalid email or password' };
    }
  };

  // ✅ Changed to accept an object: { name, email, password, phone }
  const register = async (formData) => {
    try {
      const { data } = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        role: 'TECHNICIAN',
        primary_skill: formData.primary_skill || 'General Repair', // Backend might require this
      });

      localStorage.setItem('technicianToken', data.access_token);
      localStorage.setItem('technicianUser', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      // Extract the exact FastAPI 422 error message
      let errorMsg = 'Registration failed.';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail[0].msg;
        } else {
          errorMsg = error.response.data.detail;
        }
      }
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('technicianToken');
    localStorage.removeItem('technicianUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);