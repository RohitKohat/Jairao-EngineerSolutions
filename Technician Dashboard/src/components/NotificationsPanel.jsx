import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaBell, FaCheckCircle, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import api from '../api/api';
import './NotificationsPanel.css';

const NotificationsPanel = ({ onClose, onRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/technician/notifications');
        setNotifications(data.notifications || []);
      } catch {
        // Fallback demo data
        setNotifications([
          { _id: '1', type: 'payout', title: 'Payout Released', message: 'Admin released ₹450 to your wallet.', read: false, createdAt: new Date() },
          { _id: '2', type: 'job', title: 'New Job Assigned', message: 'AC Repair at 123 Main St.', read: false, createdAt: new Date(Date.now() - 3600000) },
          { _id: '3', type: 'payout', title: 'Payout Released', message: 'Admin released ₹800 to your wallet.', read: true, createdAt: new Date(Date.now() - 86400000) },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const markAllRead = async () => {
    try {
      await api.put('/technician/notifications/read-all');
    } catch { /* ignore */ }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    onRead();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payout': return <FaMoneyBillWave />;
      case 'job': return <FaClipboardList />;
      default: return <FaBell />;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="notif-panel" ref={panelRef}>
      <div className="notif-panel-header">
        <h4>Notifications</h4>
        <button className="mark-read-btn" onClick={markAllRead}>
          <FaCheckCircle /> Mark all read
        </button>
      </div>

      <div className="notif-list">
        {loading ? (
          <p className="notif-empty">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="notif-empty">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
              <div className={`notif-icon icon-${n.type}`}>{getIcon(n.type)}</div>
              <div className="notif-content">
                <p className="notif-title">{n.title}</p>
                <p className="notif-message">{n.message}</p>
                <p className="notif-time">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className="unread-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

NotificationsPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  onRead: PropTypes.func.isRequired,
};

export default NotificationsPanel;