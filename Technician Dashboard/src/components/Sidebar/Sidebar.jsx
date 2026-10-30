import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt, FaTachometerAlt, FaClipboardList, 
  FaHistory, FaWallet, FaUserCog 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className="icon-wrap"><FaTachometerAlt /></span>
          <p>Dashboard</p>
        </NavLink>

        <NavLink to="/jobs" className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className="icon-wrap"><FaClipboardList /></span>
          <p>Active Jobs</p>
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className="icon-wrap"><FaHistory /></span>
          <p>Job History</p>
        </NavLink>

        <NavLink to="/wallet" className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className="icon-wrap"><FaWallet /></span>
          <p>My Wallet</p>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className="icon-wrap"><FaUserCog /></span>
          <p>Profile</p>
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