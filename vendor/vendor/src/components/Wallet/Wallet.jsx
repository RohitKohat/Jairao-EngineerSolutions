import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaWallet, FaHourglassHalf, FaMoneyBillWave, FaHistory, FaTimes } from 'react-icons/fa';

const Wallet = () => {
  // Mock wallet (replace with API: GET /api/vendor/wallet)
  const [wallet, setWallet] = useState({
    availableBalance: 24500,
    pendingEscrow: 8500,
    totalEarnings: 123000,
  });

  const [payouts, setPayouts] = useState([
    { _id: 'p1', amount: 15000, status: 'Completed', date: new Date(Date.now() - 86400000 * 3) },
    { _id: 'p2', amount: 5000, status: 'Pending', date: new Date(Date.now() - 3600000) },
    { _id: 'p3', amount: 22500, status: 'Completed', date: new Date(Date.now() - 86400000 * 10) },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = Number(amount);

    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > wallet.availableBalance) return toast.error('Amount exceeds available balance');
    if (amt < 500) return toast.error('Minimum withdrawal is ₹500');

    setLoading(true);
    // Mock API call (replace with: await api.post('/vendor/withdraw', { amount: amt }))
    await new Promise((res) => setTimeout(res, 800));

    setPayouts([{ _id: Date.now(), amount: amt, status: 'Pending', date: new Date() }, ...payouts]);
    setWallet({ ...wallet, availableBalance: wallet.availableBalance - amt });
    toast.success('Withdrawal request submitted!');
    setLoading(false);
    setShowModal(false);
    setAmount('');
  };

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>My Wallet</h1>
        <p>Track your earnings, escrow balance, and request payouts</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div className="stat-icon icon-green"><FaWallet /></div>
          <div className="stat-info">
            <p>Available Balance</p>
            <h3>{formatCurrency(wallet.availableBalance)}</h3>
            <button
              onClick={() => setShowModal(true)}
              disabled={wallet.availableBalance < 500}
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: wallet.availableBalance < 500 ? 'not-allowed' : 'pointer',
                opacity: wallet.availableBalance < 500 ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <FaMoneyBillWave /> Request Withdrawal
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaHourglassHalf /></div>
          <div className="stat-info">
            <p>Pending Escrow</p>
            <h3>{formatCurrency(wallet.pendingEscrow)}</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Released by admin
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <p>Total Earnings</p>
            <h3>{formatCurrency(wallet.totalEarnings)}</h3>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaHistory className="table-title-icon" />
            <h2>Payout History</h2>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr><td colSpan={3} className="empty-state">No payout requests yet.</td></tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="text-green font-bold">{formatCurrency(p.amount)}</td>
                    <td>
                      <span className={`badge ${p.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: '440px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 32, height: 32, borderRadius: '50%',
                border: 'none', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FaTimes />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, margin: '0 auto 14px',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              }}>
                <FaMoneyBillWave />
              </div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--text-main)', fontSize: 20 }}>
                Request Withdrawal
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                Available: <strong style={{ color: 'var(--success)' }}>{formatCurrency(wallet.availableBalance)}</strong>
              </p>
            </div>

            <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{
                  fontSize: 13, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  color: 'var(--text-main)',
                }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="500"
                  max={wallet.availableBalance}
                  required
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {[1000, 5000, 10000].map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAmount(a)}
                      style={{
                        flex: 1, padding: 8,
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        borderRadius: 8,
                        fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ₹{a}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(wallet.availableBalance)}
                    style={{
                      flex: 1, padding: 8,
                      border: '1px solid var(--border-color)',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Max
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: 14,
                  background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;