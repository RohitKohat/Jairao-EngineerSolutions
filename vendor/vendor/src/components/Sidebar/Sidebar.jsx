import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt, FaTachometerAlt, FaBoxOpen,
  FaShoppingCart, FaWallet, FaHistory,
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorUser');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-options">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="icon-wrap"><FaTachometerAlt /></span>
          <p>Dashboard</p>
        </NavLink>

        <NavLink
          to="/product-add"
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="icon-wrap"><FaBoxOpen /></span>
          <p>Products</p>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="icon-wrap"><FaShoppingCart /></span>
          <p>Orders</p>
        </NavLink>

        <NavLink
          to="/wallet"
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="icon-wrap"><FaWallet /></span>
          <p>My Wallet</p>
        </NavLink>

        <NavLink
          to="/payout-history"
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="icon-wrap"><FaHistory /></span>
          <p>Payout History</p>
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-divider"></div>
        <button
          type="button"
          className="sidebar-option logout-option"
          onClick={handleLogout}
        >
          <span className="icon-wrap logout-icon-wrap">
            <FaSignOutAlt />
          </span>
          <p>Logout</p>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;