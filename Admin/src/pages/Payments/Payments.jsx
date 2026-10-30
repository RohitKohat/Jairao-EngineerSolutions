import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaWallet, FaSearch, FaCheckCircle, FaSync,
  FaMoneyBillWave, FaHourglassHalf, FaCreditCard, FaChartLine,
} from 'react-icons/fa';
import api from '../../api/api';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [releasing, setReleasing] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch payments
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const paymentsRes = await api.get('/api/payments/all', { params });
      setPayments(paymentsRes.data.data || []);

      // Fetch stats separately
      try {
        const statsRes = await api.get('/api/payments/stats');
        setStats(statsRes.data.data);
      } catch (e) {
        console.warn('Stats endpoint failed, computing from payments');
      }
    } catch (error) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const releaseFunds = async (paymentId) => {
    if (!window.confirm('Release funds to vendor/technician?')) return;
    setReleasing(paymentId);
    try {
      await api.post(`/api/payments/${paymentId}/release`);
      toast.success('Funds released successfully');
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to release funds');
    } finally {
      setReleasing(null);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const getStatusClass = (status) => {
    const map = {
      PENDING: 'badge-pending',
      HELD_IN_ESCROW: 'badge-pending',
      RELEASED: 'badge-completed',
      REFUNDED: 'badge-shipped',
      FAILED: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  };

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase();
    return (
      String(p.id).includes(term) ||
      (p.razorpay_payment_id || '').toLowerCase().includes(term) ||
      (p.order_id && String(p.order_id).includes(term))
    );
  });

  // Compute stats if endpoint failed
  const computedStats = stats || {
    totalRevenue: payments.reduce((s, p) => s + p.amount, 0),
    adminCommission: payments
      .filter(p => p.status === 'RELEASED')
      .reduce((s, p) => s + p.admin_share, 0),
    fundsInEscrow: payments
      .filter(p => p.status === 'HELD_IN_ESCROW')
      .reduce((s, p) => s + p.amount, 0),
    totalReleased: payments
      .filter(p => p.status === 'RELEASED')
      .reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Payment & Payouts</h1>
        <p>Monitor escrow funds, commissions, and vendor payouts</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaChartLine /></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>{formatCurrency(computedStats.totalRevenue)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green"><FaWallet /></div>
          <div className="stat-info">
            <p>Admin Commission</p>
            <h3>{formatCurrency(computedStats.adminCommission)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaHourglassHalf /></div>
          <div className="stat-info">
            <p>Funds in Escrow</p>
            <h3>{formatCurrency(computedStats.fundsInEscrow)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple"><FaCreditCard /></div>
          <div className="stat-info">
            <p>Total Released</p>
            <h3>{formatCurrency(computedStats.totalReleased)}</h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaMoneyBillWave className="table-title-icon" />
            <h2>Transactions ({filtered.length})</h2>
          </div>
          <div className="table-actions">
            <div className="filter-group">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="HELD_IN_ESCROW">In Escrow</option>
                <option value="RELEASED">Released</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div className="search-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-export" onClick={fetchPayments}>
              <FaSync />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading payments...
            </p>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order</th>
                  <th>Gateway</th>
                  <th>Amount</th>
                  <th>Vendor Share</th>
                  <th>Admin Share</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="empty-state">No payments found.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold">#{p.id}</td>
                      <td className="font-semibold">#{p.order_id}</td>
                      <td>
                        <span className="gateway-chip">{p.gateway}</span>
                      </td>
                      <td className="font-bold">{formatCurrency(p.amount)}</td>
                      <td className="text-green font-bold">{formatCurrency(p.vendor_share)}</td>
                      <td className="text-blue font-bold">{formatCurrency(p.admin_share)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(p.status)}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {p.status === 'HELD_IN_ESCROW' ? (
                          <button
                            className="btn-release"
                            onClick={() => releaseFunds(p.id)}
                            disabled={releasing === p.id}
                          >
                            {releasing === p.id ? 'Releasing...' : 'Release Funds'}
                          </button>
                        ) : p.status === 'RELEASED' ? (
                          <span className="text-muted">
                            <FaCheckCircle /> Released
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;