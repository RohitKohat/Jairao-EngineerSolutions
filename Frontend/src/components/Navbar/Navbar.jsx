import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/tiny-slider.css";
import userIcon from "../../assets/images/user.svg";
import cartIcon from "../../assets/images/cart.svg";
import logo from "../../assets/images/WhatsApp Image 2024-11-19 at 13.32.21_689e0080 (1).jpg";

const Navbar = ({ setShowLogin, toggleTheme, theme }) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  // Dynamic filter to make icons visible in both themes
  // If the icon is originally white/light: this makes it dark in light mode and keeps it white in dark mode
  const iconFilter = theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)';

  return (
    <nav className="custom-navbar navbar navbar-expand-md navbar-dark" aria-label="Jairao Engineer Solution navigation bar">
      <div className="container">
        {/* Navbar Brand with Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src={logo} 
            alt="Logo" 
            className="me-6" 
            style={{ height: "60px", borderRadius: "8px" }} 
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={handleNavCollapse}
          data-bs-toggle="collapse"
          data-bs-target="#navbarsFurni"
          aria-controls="navbarsFurni"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavCollapsed ? "" : "show"}`} id="navbarsFurni">
          <ul className="custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/shop">Shop</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/solar">Solar</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/Service">Services</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/blog">Blog</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contact">Contact us</Link></li>
          </ul>

          <ul className="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5 align-items-center">
            
            {/* Theme Toggle Button */}
            <li className="nav-item">
              <button 
                className="nav-link theme-toggle-btn" 
                onClick={toggleTheme} 
                aria-label="Toggle Theme"
                title="Toggle Dark/Light Mode"
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>

            {/* User Login Icon */}
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="#!" 
                onClick={(e) => { e.preventDefault(); setShowLogin(true); }}
              >
                <img src={userIcon} alt="User" style={{ filter: iconFilter }} />
              </a>
            </li>

            {/* Cart Dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#!"
                id="cartDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded={showCartDropdown}
                onClick={(e) => { e.preventDefault(); setShowCartDropdown(!showCartDropdown); }}
              >
                <img src={cartIcon} alt="Cart" style={{ filter: iconFilter }} />
              </a>
              <ul className={`dropdown-menu dropdown-menu-end ${showCartDropdown ? "show" : ""}`} aria-labelledby="cartDropdown">
                <li><Link className="dropdown-item" to="/cart">View Cart</Link></li>
                <li><Link className="dropdown-item" to="/myorders">My Orders</Link></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};

export default Navbar;