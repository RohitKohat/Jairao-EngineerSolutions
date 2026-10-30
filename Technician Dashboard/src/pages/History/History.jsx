import { useEffect, useState } from 'react';
import { FaHistory, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import api from '../../api/api';

const History = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/technician/jobs/history');
        setJobs(data.jobs || []);
      } catch {
        setJobs([
          { _id: 'h1', title: 'AC - No Cooling', customer: 'Alice Brown', price: 700, status: 'Paid', completedAt: new Date(Date.now() - 86400000 * 2) },
          { _id: 'h2', title: 'Refrigerator - Gas Leak', customer: 'Bob White', price: 800, status: 'Paid', completedAt: new Date(Date.now() - 86400000 * 5) },
          { _id: 'h3', title: 'Washing Machine - No Drain', customer: 'Carol Davis', price: 500, status: 'In Escrow', completedAt: new Date(Date.now() - 3600000 * 8) },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="history-page-wrapper">
      <div className="page-header">
        <h1>Job History</h1>
        <p>All your completed jobs and their payout status</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaHistory className="table-title-icon" />
            <h2>Completed Jobs</h2>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Completed</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="empty-state">Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">No completed jobs yet.</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id}>
                    <td className="font-semibold">{job.title}</td>
                    <td>{job.customer}</td>
                    <td className="text-green font-bold">{formatCurrency(job.price)}</td>
                    <td>{new Date(job.completedAt).toLocaleDateString('en-GB')}</td>
                    <td>
                      <span className={`badge ${job.status === 'Paid' ? 'badge-completed' : 'badge-pending'}`}>
                        {job.status === 'Paid' ? <FaCheckCircle /> : <FaHourglassHalf />} {job.status}
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

export default History;