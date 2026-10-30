import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';

// Existing Pages
import Dashboard from './components/dashboard';
import Product from './components/product';
import Newproduct from './components/addnewproduct';
import Newaccount from './components/newaccount';
import Registeruser from './components/registeruser';
import Login from './components/login';

// New Pages (Vendor-specific)
import Orders from './components/Orders/Orders';
import Wallet from './components/Wallet/Wallet';
import PayoutHistory from './components/PayoutHistory/PayoutHistory';

import './App.css';

// ─────────────────────────────────────────────
// Scroll to top on route change
// ─────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// ─────────────────────────────────────────────
// Dashboard Layout — Navbar + Sidebar + Main
// ─────────────────────────────────────────────
const DashboardLayout = ({ theme, toggleTheme }) => {
  return (
    <div className="dashboard-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product-add" element={<Product />} />
            <Route path="/addnew" element={<Newproduct />} />
            <Route path="/updateaccount" element={<Newaccount />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/payout-history" element={<PayoutHistory />} />
            {/* Default → Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vendor-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('vendor-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`vendor-app ${theme}`}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme}
        newestOnTop
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
      <ScrollToTop />

      <Routes>
        {/* Auth pages (no Navbar/Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/registeraccount" element={<Registeruser />} />

        {/* Dashboard (with Navbar + Sidebar) */}
        <Route
          path="/*"
          element={
            <DashboardLayout theme={theme} toggleTheme={toggleTheme} />
          }
        />
      </Routes>
    </div>
  );
};

export default App;