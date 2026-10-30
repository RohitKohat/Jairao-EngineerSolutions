import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaUsers, FaStore, FaTools, FaShoppingCart, FaMoneyBillWave,
  FaHourglassHalf, FaClipboardList, FaArrowRight,
} from 'react-icons/fa';
import api from '../../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/dashboard-stats');
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  if (loading) {
    return <p style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</p>;
  }

  if (!stats) return null;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview at a glance</p>
      </div>

      {/* Primary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaUsers /></div>
          <div className="stat-info">
            <p>Total Users</p>
            <h3>{stats.users.total}</h3>
            <span className="stat-note">
              {stats.users.vendors} vendors · {stats.users.technicians} techs · {stats.users.customers} customers
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-purple"><FaStore /></div>
          <div className="stat-info">
            <p>Total Products</p>
            <h3>{stats.products.total}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-green"><FaShoppingCart /></div>
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{stats.orders.total}</h3>
            <span className="stat-note">
              {stats.orders.pending} pending · {stats.orders.delivered} delivered
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaClipboardList /></div>
          <div className="stat-info">
            <p>Service Requests</p>
            <h3>{stats.services.total}</h3>
            <span className="stat-note">{stats.services.pending} pending</span>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <h2 className="section-title">Financial Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>{formatCurrency(stats.financials.total_revenue)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <p>Admin Commission</p>
            <h3>{formatCurrency(stats.financials.admin_commission)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaHourglassHalf /></div>
          <div className="stat-info">
            <p>Escrow Held</p>
            <h3>{formatCurrency(stats.financials.escrow_held)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-red"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <p>Pending Payouts</p>
            <h3>{formatCurrency(stats.financials.pending_payouts)}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-actions">
        <button className="action-card" onClick={() => navigate('/vendors')}>
          <FaStore />
          <span>Manage Vendors</span>
          <FaArrowRight className="action-arrow" />
        </button>
        <button className="action-card" onClick={() => navigate('/technicians')}>
          <FaTools />
          <span>Manage Technicians</span>
          <FaArrowRight className="action-arrow" />
        </button>
        <button className="action-card" onClick={() => navigate('/payments')}>
          <FaMoneyBillWave />
          <span>Payments & Payouts</span>
          <FaArrowRight className="action-arrow" />
        </button>
        <button className="action-card" onClick={() => navigate('/orders')}>
          <FaShoppingCart />
          <span>All Orders</span>
          <FaArrowRight className="action-arrow" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;