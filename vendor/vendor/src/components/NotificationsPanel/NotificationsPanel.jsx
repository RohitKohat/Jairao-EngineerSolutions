import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FaBell, FaCheckCircle, FaMoneyBillWave,
  FaClipboardList, FaShoppingCart, FaBoxOpen,
} from 'react-icons/fa';
import './NotificationsPanel.css';

const NotificationsPanel = ({ onClose, onRead, unreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const panelRef = useRef(null);

  // Fetch notifications from backend (mock fallback)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Replace with real API: GET /api/vendor/notifications
        // const token = localStorage.getItem('vendorToken');
        // const { data } = await axios.get('/api/vendor/notifications', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setNotifications(data.notifications || []);

        // Mock data for now
        await new Promise((res) => setTimeout(res, 300));
        setNotifications([
          {
            _id: 'n1',
            type: 'payout',
            title: 'Payout Released',
            message: 'Admin released ₹15,000 to your wallet.',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            _id: 'n2',
            type: 'order',
            title: 'New Order Received',
            message: 'You have a new order #ORD-108 for Samsung AC.',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          },
          {
            _id: 'n3',
            type: 'product',
            title: 'Low Stock Alert',
            message: 'LG Washing Machine stock is running low (3 units left).',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          },
          {
            _id: 'n4',
            type: 'payout',
            title: 'Payout Released',
            message: 'Admin released ₹22,500 to your wallet.',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            _id: 'n5',
            type: 'order',
            title: 'Order Delivered',
            message: 'Order #ORD-102 was delivered to Jane Smith.',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          },
          {
            _id: 'n6',
            type: 'system',
            title: 'Welcome to Jairao EngineerSolutions',
            message: 'Your vendor account has been verified successfully.',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onRead();
  };

  const markOneRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payout': return <FaMoneyBillWave />;
      case 'order': return <FaShoppingCart />;
      case 'product': return <FaBoxOpen />;
      case 'system': return <FaClipboardList />;
      default: return <FaBell />;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-GB');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCountLocal = notifications.filter((n) => !n.read).length;
  const displayedUnread = unreadCount ?? unreadCountLocal;

  return (
    <div className="notif-panel" ref={panelRef}>
      {/* Header */}
      <div className="notif-panel-header">
        <div className="notif-panel-title">
          <h4>Notifications</h4>
          {displayedUnread > 0 && (
            <span className="notif-count-pill">{displayedUnread} new</span>
          )}
        </div>
        {unreadCountLocal > 0 && (
          <button className="mark-read-btn" onClick={markAllRead}>
            <FaCheckCircle /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="notif-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'unread' ? 'active' : ''}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button
          className={filter === 'read' ? 'active' : ''}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="notif-list">
        {loading ? (
          <p className="notif-empty">Loading notifications...</p>
        ) : filtered.length === 0 ? (
          <div className="notif-empty-wrap">
            <FaBell className="notif-empty-icon" />
            <p className="notif-empty">
              {filter === 'unread'
                ? 'No unread notifications.'
                : filter === 'read'
                ? 'No read notifications.'
                : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${n.read ? 'read' : 'unread'}`}
              onClick={() => markOneRead(n._id)}
            >
              <div className={`notif-icon icon-${n.type}`}>
                {getIcon(n.type)}
              </div>
              <div className="notif-content">
                <div className="notif-title-row">
                  <p className="notif-title">{n.title}</p>
                  {!n.read && <span className="unread-dot" />}
                </div>
                <p className="notif-message">{n.message}</p>
                <p className="notif-time">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="notif-footer">
          <button
            className="notif-view-all-btn"
            onClick={() => {
              // Navigate to full notifications page (optional)
              onClose();
              // navigate('/notifications');
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

NotificationsPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  onRead: PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
};

NotificationsPanel.defaultProps = {
  unreadCount: 0,
};

export default NotificationsPanel;