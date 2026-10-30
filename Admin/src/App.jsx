import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Payments from './pages/Payments/Payments';
import Vendors from './pages/Vendors/Vendors';
import Technicians from './pages/Technicians/Technicians';
import PayoutHistory from './pages/PayoutHistory/PayoutHistory';
import ServiceRequests from './pages/ServiceRequests/ServiceRequests'; // ✅ NEW IMPORT
import Login from './pages/login';
import Createaccount from './pages/createaccount';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// ─── Protected Route Wrapper ───
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const DashboardLayout = ({ theme, toggleTheme }) => {
  return (
    <div className="dashboard-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/payout-history" element={<PayoutHistory />} />
            <Route path="/service-requests" element={<ServiceRequests />} /> {/* ✅ NEW ROUTE */}
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

const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('admin-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`admin-app ${theme}`}>
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
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<Createaccount />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;