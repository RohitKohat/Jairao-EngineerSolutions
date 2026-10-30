import { useEffect, useState } from 'react';
import { FaWallet, FaHourglassHalf, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
// ✅ Removed: import { toast } from 'react-toastify';
import api from '../../api/api';
import WithdrawModal from '../../components/WithdrawModal';
import './Wallet.css';

const Wallet = () => {
  const [wallet, setWallet] = useState({ availableBalance: 0, pendingEscrow: 0, totalEarnings: 0 });
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/technician/wallet');
      setWallet(data.wallet);
      setPayouts(data.payouts || []);
    } catch {
      setWallet({ availableBalance: 1200, pendingEscrow: 450, totalEarnings: 8500 });
      setPayouts([
        { _id: 'p1', amount: 1000, status: 'Completed', date: new Date(Date.now() - 86400000 * 3) },
        { _id: 'p2', amount: 500, status: 'Pending', date: new Date(Date.now() - 3600000) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleSuccess = () => { fetchWallet(); };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  if (loading) return <p style={{ padding: 40, textAlign: 'center' }}>Loading wallet...</p>;

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>My Wallet</h1>
        <p>Track your earnings and request withdrawals</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon icon-green"><FaWallet /></div>
          <div className="stat-info">
            <p>Available Balance</p>
            <h3>{formatCurrency(wallet.availableBalance)}</h3>
            <button className="withdraw-btn" onClick={() => setShowModal(true)} disabled={wallet.availableBalance < 100}>
              <FaMoneyBillWave /> Withdraw
            </button>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaHourglassHalf /></div>
          <div className="stat-info">
            <p>Pending Escrow</p>
            <h3>{formatCurrency(wallet.pendingEscrow)}</h3>
            <span className="stat-note">Released by admin</span>
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
                    <td>{new Date(p.date).toLocaleDateString('en-GB')}</td>
                    <td className="text-green font-bold">{formatCurrency(p.amount)}</td>
                    <td>
                      <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <WithdrawModal
          availableBalance={wallet.availableBalance}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Wallet;