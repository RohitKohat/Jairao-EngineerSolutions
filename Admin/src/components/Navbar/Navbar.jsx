import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { assets } from '../../assets/assets';
import { FaUserCircle, FaBell, FaBars, FaChevronDown, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('token');
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <FaBars className="menu-icon" />
        <div className="logo-wrap">
          <img className="logo" src={assets.logo} alt="Logo" />
          <span className="brand-name">Jairao EngineerSolutions</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="bell-container">
          <FaBell className="bell-icon" />
          <span className="bell-badge">2</span>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="profile-container" onClick={toggleDropdown}>
          <FaUserCircle className="profile-icon" />
          <div className="profile-text">
            <span className="profile-name">Admin</span>
            <span className="profile-role">Super Admin</span>
          </div>
          <FaChevronDown className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />

          {showDropdown && (
            <ul className="dropdown">
              <li onClick={() => navigate('/settings')}>
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