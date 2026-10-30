import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt, FaPlusCircle, FaListUl, FaShoppingCart,
  FaWallet, FaHistory, FaStore, FaTools, FaWrench,
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/add', name: 'Add Items', icon: <FaPlusCircle /> },
    { path: '/list', name: 'List Items', icon: <FaListUl /> },
    { path: '/service-requests', name: 'Service Requests', icon: <FaWrench /> },
    { path: '/orders', name: 'Orders', icon: <FaShoppingCart /> },
    { path: '/payments', name: 'Payments', icon: <FaWallet /> },
    { path: '/payout-history', name: 'Payout History', icon: <FaHistory /> },
    { path: '/vendors', name: 'Vendors', icon: <FaStore /> },
    { path: '/technicians', name: 'Technicians', icon: <FaTools /> },
  ];

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;