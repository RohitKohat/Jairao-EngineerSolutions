import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import {
  FaUserCircle, FaBell, FaBars, FaChevronDown, FaSignOutAlt, FaCog,
} from 'react-icons/fa';
import NotificationsPanel from '../NotificationsPanel';
import logoImage from '../../assets/image.png';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <FaBars className="menu-icon" />

        <div className="logo-wrap">
          <img src={logoImage} alt="Jairao EngineerSolutions" className="navbar-logo" />
          <span className="brand-name">Jairao EngineerSolutions</span>
          <span className="brand-tag">Technician</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="bell-container" onClick={() => setShowNotifs(!showNotifs)}>
          <FaBell className="bell-icon" />
          {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
        </div>

        {showNotifs && (
          <NotificationsPanel
            onClose={() => setShowNotifs(false)}
            onRead={() => setUnreadCount(0)}
          />
        )}

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div
          className="profile-container"
          ref={dropdownRef}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FaUserCircle className="profile-icon" />
          <div className="profile-text">
            <span className="profile-name">{user?.name || 'Technician'}</span>
            <span className="profile-role">{user?.primarySkill || 'Service Provider'}</span>
          </div>
          <FaChevronDown className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />

          {showDropdown && (
            <ul className="dropdown">
              <li onClick={() => navigate('/profile')}>
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