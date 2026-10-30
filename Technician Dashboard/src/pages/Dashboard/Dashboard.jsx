import { useEffect, useState } from 'react';
import { 
  FaWallet, FaHourglassHalf, FaCheckCircle, FaRupeeSign, 
  FaClipboardList, FaPlay 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const [wallet, setWallet] = useState({
    availableBalance: 0, pendingEscrow: 0, jobsCompleted: 0, totalEarnings: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [walletRes, jobsRes] = await Promise.all([
        api.get('/api/technician/wallet'),
        api.get('/api/technician/jobs'),
      ]);
      setWallet(walletRes.data.wallet || {});
      setJobs(jobsRes.data.jobs || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      // Optimistic UI Update
      const updated = jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j);
      setJobs(updated);
      
      await api.put(`/api/technician/jobs/${jobId}/status`, { status: newStatus });
      toast.success(`Job marked as ${newStatus.replace('_', ' ')}!`);
      
      // Refresh data to update wallet if needed
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update job status');
      fetchData(); // Revert on failure
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'badge-pending';
    if (status === 'IN_PROGRESS') return 'badge-shipped'; // Blue
    if (status === 'COMPLETED') return 'badge-completed'; // Green
    return 'badge-pending';
  };

  if (loading) return <p style={{ padding: 40, textAlign: 'center' }}>Loading...</p>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Track your earnings, jobs, and performance at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green"><FaWallet /></div>
          <div className="stat-info">
            <p>Available Balance</p>
            <h3>{formatCurrency(wallet.availableBalance)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaHourglassHalf /></div>
          <div className="stat-info">
            <p>Pending Escrow</p>
            <h3>{formatCurrency(wallet.pendingEscrow)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaCheckCircle /></div>
          <div className="stat-info">
            <p>Jobs Completed</p>
            <h3>{wallet.jobsCompleted}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple"><FaRupeeSign /></div>
          <div className="stat-info">
            <p>Total Earnings</p>
            <h3>{formatCurrency(wallet.totalEarnings)}</h3>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaClipboardList className="table-title-icon" />
            <h2>Recent Jobs</h2>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">No jobs assigned yet.</td></tr>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td className="font-semibold">
                      {job.title}
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{job.description}</div>
                    </td>
                    <td>{job.customer}</td>
                    <td className="text-green font-bold">{formatCurrency(job.price)}</td>
                    <td>
                      <span className={`badge ${getStatusClass(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {job.status === 'PENDING' && (
                        <button className="btn-start" onClick={() => updateJobStatus(job.id, 'IN_PROGRESS')}>
                          <FaPlay /> Accept & Start
                        </button>
                      )}
                      {job.status === 'IN_PROGRESS' && (
                        <button className="btn-complete" onClick={() => updateJobStatus(job.id, 'COMPLETED')}>
                          <FaCheckCircle /> Mark Complete
                        </button>
                      )}
                      {job.status === 'COMPLETED' && (
                        <span className="text-muted">Done</span>
                      )}
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

export default Dashboard;