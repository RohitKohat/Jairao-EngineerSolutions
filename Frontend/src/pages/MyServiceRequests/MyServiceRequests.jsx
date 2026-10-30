import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaTools, FaCalendarAlt, FaMapMarkerAlt, FaPhone,
  FaSync, FaHome, FaClock, FaCheckCircle, FaTimesCircle,
  FaWrench, FaUserCog,
} from 'react-icons/fa';
import { serviceApi } from '../../api';
import { StoreContext } from '../../context/StoreContext';
import './MyServiceRequests.css';

const MyServiceRequests = () => {
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchRequests = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await serviceApi.getMyServiceRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Fetch service requests error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
      } else {
        toast.error('Failed to load service requests');
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusMeta = (status) => {
    const map = {
      PENDING: { label: 'Pending', class: 'pending', icon: <FaClock /> },
      ASSIGNED: { label: 'Assigned', class: 'assigned', icon: <FaUserCog /> },
      ACCEPTED: { label: 'Accepted', class: 'accepted', icon: <FaCheckCircle /> },
      IN_PROGRESS: { label: 'In Progress', class: 'in-progress', icon: <FaWrench /> },
      COMPLETED: { label: 'Completed', class: 'completed', icon: <FaCheckCircle /> },
      CANCELLED: { label: 'Cancelled', class: 'cancelled', icon: <FaTimesCircle /> },
    };
    return map[status] || { label: status, class: 'pending', icon: <FaClock /> };
  };

  const formatServiceType = (type) => {
    const map = {
      AC_REPAIR: 'Air Conditioner Repair',
      WASHING_MACHINE_REPAIR: 'Washing Machine Repair',
      REFRIGERATOR_REPAIR: 'Refrigerator Repair',
      WATER_PURIFIER_REPAIR: 'Water Purifier Repair',
      SOLAR_INSTALLATION: 'Solar Installation',
      INSTALLATION: 'Installation',
      MAINTENANCE: 'Maintenance',
    };
    return map[type] || type?.replace(/_/g, ' ') || 'Service';
  };

  const filtered =
    filterStatus === 'all'
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  // Stats
  const pending = requests.filter((r) =>
    ['PENDING', 'ASSIGNED', 'ACCEPTED'].includes(r.status)
  ).length;
  const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length;
  const completed = requests.filter((r) => r.status === 'COMPLETED').length;

  // Not logged in
  if (!token) {
    return (
      <div className="msr-page">
        <div className="msr-empty">
          <div className="msr-empty-icon">🔒</div>
          <h2>Please login to view service requests</h2>
          <p>Sign in to see your bookings and track technician visits.</p>
          <button className="msr-btn primary" onClick={() => navigate('/')}>
            <FaHome /> Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="msr-page">
        <div className="msr-loading">
          <div className="msr-spinner"></div>
          <p>Loading your service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="msr-page">
      {/* Header */}
      <div className="msr-header">
        <div>
          <h1>My Service Requests</h1>
          <p>Track bookings, technician visits, and service status</p>
        </div>
        <button className="msr-refresh-btn" onClick={fetchRequests} title="Refresh">
          <FaSync />
        </button>
      </div>

      {/* Stats */}
      {requests.length > 0 && (
        <div className="msr-stats">
          <div className="msr-stat">
            <div className="msr-stat-icon yellow"><FaClock /></div>
            <div>
              <p>Pending</p>
              <h3>{pending}</h3>
            </div>
          </div>
          <div className="msr-stat">
            <div className="msr-stat-icon blue"><FaWrench /></div>
            <div>
              <p>In Progress</p>
              <h3>{inProgress}</h3>
            </div>
          </div>
          <div className="msr-stat">
            <div className="msr-stat-icon green"><FaCheckCircle /></div>
            <div>
              <p>Completed</p>
              <h3>{completed}</h3>
            </div>
          </div>
          <div className="msr-stat">
            <div className="msr-stat-icon purple"><FaTools /></div>
            <div>
              <p>Total</p>
              <h3>{requests.length}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {requests.length > 0 && (
        <div className="msr-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'ASSIGNED', label: 'Assigned' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.key}
              className={`msr-filter-btn ${filterStatus === f.key ? 'active' : ''}`}
              onClick={() => setFilterStatus(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="msr-empty">
          <div className="msr-empty-icon">🔧</div>
          <h2>
            {requests.length === 0
              ? 'No service requests yet'
              : 'No requests with this status'}
          </h2>
          <p>
            {requests.length === 0
              ? 'Book your first service appointment to get started.'
              : 'Try a different filter to see other requests.'}
          </p>
          <Link to="/services" className="msr-btn primary">
            <FaTools /> Book a Service
          </Link>
        </div>
      ) : (
        <div className="msr-list">
          {filtered.map((req) => {
            const meta = getStatusMeta(req.status);
            return (
              <div key={req.id} className="msr-card">
                {/* Head */}
                <div className="msr-card-head">
                  <div className="msr-card-id">
                    <div className="msr-card-icon">
                      <FaTools />
                    </div>
                    <div>
                      <strong>{formatServiceType(req.service_type)}</strong>
                      <span>Request #{req.id}</span>
                    </div>
                  </div>
                  <span className={`msr-status ${meta.class}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>

                {/* Description */}
                {req.description && (
                  <div className="msr-card-desc">
                    <p>{req.description}</p>
                  </div>
                )}

                {/* Meta */}
                <div className="msr-card-meta">
                  {req.preferred_date && (
                    <div className="msr-meta-item">
                      <FaCalendarAlt />
                      <span>{formatDate(req.preferred_date)}</span>
                    </div>
                  )}
                  {req.address && (
                    <div className="msr-meta-item">
                      <FaMapMarkerAlt />
                      <span>{req.address}</span>
                    </div>
                  )}
                  {req.phone && (
                    <div className="msr-meta-item">
                      <FaPhone />
                      <span>{req.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="msr-card-foot">
                  <span className="msr-card-date">
                    Created {formatDate(req.created_at)}
                  </span>
                  {req.technician_name && (
                    <span className="msr-tech-badge">
                      <FaUserCog /> {req.technician_name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyServiceRequests;