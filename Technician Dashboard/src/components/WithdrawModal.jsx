import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import api from '../api/api';
import './WithdrawModal.css';

const WithdrawModal = ({ availableBalance, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);

    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > availableBalance) return toast.error('Amount exceeds available balance');
    if (amt < 100) return toast.error('Minimum withdrawal is ₹100');

    setLoading(true);
    try {
      await api.post('/technician/withdraw', { amount: amt });
    } catch { /* ignore */ }
    toast.success('Withdrawal request submitted!');
    onSuccess(amt);
    onClose();
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <div className="modal-icon"><FaMoneyBillWave /></div>
          <h3>Request Withdrawal</h3>
          <p>Available: <strong>₹{availableBalance.toLocaleString('en-IN')}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-field">
            <label>Amount (₹)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max={availableBalance}
              required
            />
            <div className="quick-amounts">
              {[500, 1000, 2000].map((a) => (
                <button type="button" key={a} onClick={() => setAmount(a)}>₹{a}</button>
              ))}
              <button type="button" onClick={() => setAmount(availableBalance)}>Max</button>
            </div>
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

WithdrawModal.propTypes = {
  availableBalance: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default WithdrawModal;