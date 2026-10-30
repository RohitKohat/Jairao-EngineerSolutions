import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaHistory, FaSearch, FaStore, FaTools,
  FaCheckCircle, FaClock, FaMoneyBillWave,
  FaTimes, FaSync,
} from 'react-icons/fa';
import api from '../../api/api';
import './PayoutHistory.css';

const PayoutHistory = () => {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payoutsRes, statsRes] = await Promise.all([
        api.get('/api/payouts/all?limit=100'),
        api.get('/api/payouts/stats').catch(() => ({ data: null })),
      ]);
      setPayouts(payoutsRes.data.payouts || []);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load payouts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approvePayout = async (id) => {
    if (!window.confirm('Approve this payout?')) return;
    try {
      await api.put(`/api/payouts/${id}/approve`);
      toast.success('Payout approved');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve');
    }
  };

  const openRejectModal = (id) => {
    setRejecting(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await api.put(`/api/payouts/${rejecting}/reject`, { reason: rejectReason });
      toast.success('Payout rejected');
      setShowRejectModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject');
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const getStatusClass = (status) => {
    const map = {
      PENDING: 'badge-pending',
      APPROVED: 'badge-shipped',
      COMPLETED: 'badge-completed',
      REJECTED: 'badge-cancelled',
      FAILED: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  };

  const filtered = payouts.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      String(p.id).includes(term) ||
      String(p.user_id).includes(term) ||
      (p.transaction_id || '').toLowerCase().includes(term);

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const computedStats = stats || {
    total_released: payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((s, p) => s + p.amount, 0),
    pending_payouts: payouts
      .filter(p => ['PENDING', 'APPROVED'].includes(p.status))
      .reduce((s, p) => s + p.amount, 0),
    failed_payouts: payouts
      .filter(p => ['REJECTED', 'FAILED'].includes(p.status))
      .reduce((s, p) => s + p.amount, 0),
    total_transactions: payouts.length,
  };

  return (
    <div className="payout-history-page">
      <div className="page-header">
        <h1>Payout History</h1>
        <p>Approve or reject vendor & technician withdrawal requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green"><FaCheckCircle /></div>
          <div className="stat-info">
            <p>Total Released</p>
            <h3>{formatCurrency(computedStats.total_released)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaClock /></div>
          <div className="stat-info">
            <p>Pending Payouts</p>
            <h3>{formatCurrency(computedStats.pending_payouts)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-red"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <p>Failed Payouts</p>
            <h3>{formatCurrency(computedStats.failed_payouts)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaHistory /></div>
          <div className="stat-info">
            <p>Total Transactions</p>
            <h3>{computedStats.total_transactions}</h3>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaHistory className="table-title-icon" />
            <h2>All Payouts ({filtered.length})</h2>
          </div>
          <div className="table-actions">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="search-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-export" onClick={fetchData}>
              <FaSync />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="empty-state">No payouts found.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold">#{p.id}</td>
                      <td>
                        <span className="user-chip">
                          {p.payout_method === 'upi' ? <FaTools /> : <FaStore />}
                          User #{p.user_id}
                        </span>
                      </td>
                      <td className="text-muted">{p.payout_method}</td>
                      <td className="font-bold">{formatCurrency(p.amount)}</td>
                      <td className="text-muted">{p.transaction_id || '—'}</td>
                      <td className="text-muted">
                        {new Date(p.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.status === 'PENDING' ? (
                          <div className="payout-actions">
                            <button
                              className="btn-approve"
                              onClick={() => approvePayout(p.id)}
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => openRejectModal(p.id)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : p.status === 'COMPLETED' ? (
                          <span className="text-muted">
                            <FaCheckCircle /> Done
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-box modal-box-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon icon-red-bg"><FaTimes /></div>
              <h3>Reject Payout #{rejecting}</h3>
              <p>Provide a reason for rejection</p>
            </div>
            <div className="form-field">
              <label>Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Insufficient balance, wrong bank details..."
                rows={3}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={submitReject}>
                Reject Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutHistory;