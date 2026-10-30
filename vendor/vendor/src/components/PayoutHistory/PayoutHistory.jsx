import { useState } from 'react';
import { FaHistory, FaSearch, FaCheckCircle, FaClock, FaDownload } from 'react-icons/fa';

const PayoutHistory = () => {
  const [payouts] = useState([
    { id: 'PO-1001', amount: 15000, method: 'Bank Transfer', status: 'Completed', date: '2025-01-15', refId: 'TXN-8821' },
    { id: 'PO-1002', amount: 5000, method: 'UPI', status: 'Pending', date: '2025-01-14', refId: 'TXN-8819' },
    { id: 'PO-1003', amount: 22500, method: 'Bank Transfer', status: 'Completed', date: '2025-01-10', refId: 'TXN-8802' },
    { id: 'PO-1004', amount: 8000, method: 'UPI', status: 'Completed', date: '2025-01-05', refId: 'TXN-8788' },
    { id: 'PO-1005', amount: 12000, method: 'Bank Transfer', status: 'Failed', date: '2025-01-02', refId: 'TXN-8770' },
  ]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-completed';
      case 'Pending': return 'badge-pending';
      case 'Failed': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  const filtered = payouts.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      p.id.toLowerCase().includes(term) ||
      p.refId.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalReleased = payouts.filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="payout-history-page">
      <div className="page-header">
        <h1>Payout History</h1>
        <p>All your past payout requests and their current status</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green"><FaCheckCircle /></div>
          <div className="stat-info">
            <p>Total Released</p>
            <h3>{formatCurrency(totalReleased)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaClock /></div>
          <div className="stat-info">
            <p>Pending Requests</p>
            <h3>{formatCurrency(totalPending)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaHistory /></div>
          <div className="stat-info">
            <p>Total Transactions</p>
            <h3>{payouts.length}</h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaHistory className="table-title-icon" />
            <h2>All Payouts</h2>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '9px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaSearch style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', fontSize: 14 }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '10px 16px 10px 38px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  outline: 'none',
                  width: 200,
                }}
              />
            </div>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payout ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No payouts found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.id}</td>
                    <td className="text-green font-bold">{formatCurrency(p.amount)}</td>
                    <td>{p.method}</td>
                    <td className="text-muted">{p.refId}</td>
                    <td>{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={`badge ${getStatusClass(p.status)}`}>
                        {p.status === 'Completed' && <FaCheckCircle />}
                        {p.status === 'Pending' && <FaClock />}
                        {' '}{p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutHistory;