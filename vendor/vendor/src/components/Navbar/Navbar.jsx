import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaUserCircle, FaBell, FaBars, FaChevronDown, FaSignOutAlt, FaCog,
} from 'react-icons/fa';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [vendorUser, setVendorUser] = useState({
    name: 'Vendor',
    company: 'TechStore',
  });
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Load vendor user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vendorUser');
    if (stored) {
      try {
        setVendorUser(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Close dropdown / notif panel when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorUser');
    navigate('/login');
  };

  const handleBellClick = () => {
    setShowNotifs((prev) => !prev);
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
    setShowNotifs(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <FaBars className="menu-icon" />
        <div className="logo-wrap">
          <span className="brand-name">Jairao EngineerSolutions</span>
          <span className="brand-tag">Vendor</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Bell / Notifications */}
        <div className="bell-wrapper" ref={notifRef}>
          <div className="bell-container" onClick={handleBellClick}>
            <FaBell className="bell-icon" />
            {unreadCount > 0 && (
              <span className="bell-badge">{unreadCount}</span>
            )}
          </div>
          {showNotifs && (
            <NotificationsPanel
              onClose={() => setShowNotifs(false)}
              onRead={() => setUnreadCount(0)}
              unreadCount={unreadCount}
            />
          )}
        </div>

        {/* Theme toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Profile dropdown */}
        <div
          className="profile-container"
          ref={dropdownRef}
          onClick={handleProfileClick}
        >
          <FaUserCircle className="profile-icon" />
          <div className="profile-text">
            <span className="profile-name">{vendorUser.name || 'Vendor'}</span>
            <span className="profile-role">
              {vendorUser.company || 'Store'}
            </span>
          </div>
          <FaChevronDown
            className={`chevron-icon ${showDropdown ? 'rotate' : ''}`}
          />

          {showDropdown && (
            <ul className="dropdown">
              <li onClick={() => navigate('/updateaccount')}>
                <FaCog className="dropdown-icon" /> Settings
              </li>
              <li onClick={handleLogout} className="logout-item">
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

export default Navbar;