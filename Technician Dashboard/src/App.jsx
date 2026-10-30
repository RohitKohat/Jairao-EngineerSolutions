import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'; // ✅ BrowserRouter removed
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';

import Dashboard from './pages/Dashboard/Dashboard';
import Jobs from './pages/Jobs/Jobs';
import History from './pages/History/History';
import Wallet from './pages/Wallet/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const DashboardLayout = ({ theme, toggleTheme }) => (
  <div className="dashboard-layout">
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <div className="app-content">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/history" element={<History />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  </div>
);

DashboardLayout.propTypes = {
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppContent = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('tech-theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('tech-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className={`tech-app ${theme}`}>
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
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
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

// ✅ BrowserRouter is ONLY in main.jsx — no wrapper needed here
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;