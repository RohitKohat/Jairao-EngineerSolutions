import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaTools, FaSearch, FaBan, FaCheckCircle, FaEye,
  FaClipboardList, FaCheckSquare, FaHourglassHalf, FaWallet,
} from 'react-icons/fa';
import api from '../../api/api';
import './Technicians.css';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTechnicians = async () => {
    try {
      const { data } = await api.get('/api/admin/technicians?limit=100');
      setTechnicians(data.technicians || []);
    } catch (error) {
      toast.error('Failed to load technicians');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const toggleStatus = async (tech) => {
    const action = tech.is_active ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${tech.name}?`)) return;

    try {
      await api.put(`/api/admin/users/${tech.id}/toggle-status`);
      toast.success(`${tech.name} ${action}d successfully`);
      fetchTechnicians();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    }
  };

  const openDetails = (tech) => {
    setSelectedTech(tech);
    setShowModal(true);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const filteredTechnicians = technicians.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      (t.primary_skill || '').toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <p style={{ padding: 40, textAlign: 'center' }}>Loading technicians...</p>;
  }

  return (
    <div className="tech-page">
      <div className="tech-header">
        <div className="tech-header-icon"><FaTools /></div>
        <div>
          <h2>Technicians Management</h2>
          <p>{technicians.length} technicians registered on the platform</p>
        </div>
      </div>

      <div className="tech-card">
        <div className="tech-card-top">
          <h3>All Technicians ({filteredTechnicians.length})</h3>
          <div className="tech-search">
            <FaSearch className="tech-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr>
                <th>Technician</th>
                <th>Contact</th>
                <th>Primary Skill</th>
                <th>Total Jobs</th>
                <th>Completed</th>
                <th>Active</th>
                <th>Available</th>
                <th>Escrow</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechnicians.length === 0 ? (
                <tr><td colSpan={10} className="tech-empty">No technicians found.</td></tr>
              ) : (
                filteredTechnicians.map((tech) => (
                  <tr key={tech.id}>
                    <td>
                      <div className="tech-cell">
                        <strong>{tech.name}</strong>
                        <span className="tech-id">ID: #{tech.id}</span>
                      </div>
                    </td>
                    <td className="text-muted">
                      <div>{tech.email}</div>
                      <div>{tech.phone || '—'}</div>
                    </td>
                    <td>
                      <span className="skill-chip">{tech.primary_skill || '—'}</span>
                    </td>
                    <td>{tech.stats.total_jobs}</td>
                    <td className="text-green font-bold">{tech.stats.jobs_completed}</td>
                    <td className="text-yellow font-bold">{tech.stats.active_jobs}</td>
                    <td className="text-green font-bold">
                      {formatCurrency(tech.stats.available_balance)}
                    </td>
                    <td className="text-yellow font-bold">
                      {formatCurrency(tech.stats.pending_escrow)}
                    </td>
                    <td>
                      <span className={`badge ${tech.is_active ? 'badge-active' : 'badge-suspended'}`}>
                        {tech.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="tech-actions">
                      <button
                        className="btn-icon btn-icon-primary"
                        onClick={() => openDetails(tech)}
                        title="View details"
                      >
                        <FaEye />
                      </button>
                      
                      <button
                        className={`btn-status ${tech.is_active ? 'danger' : 'success'}`}
                        onClick={() => toggleStatus(tech)}
                      >
                        {tech.is_active
                          ? <><FaBan /> Suspend</>
                          : <><FaCheckCircle /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {showModal && selectedTech && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon"><FaTools /></div>
              <h3>{selectedTech.name}</h3>
              <p>{selectedTech.primary_skill || 'Technician'}</p>
            </div>
            <div className="modal-details">
              <div className="detail-row">
                <span>Email</span>
                <strong>{selectedTech.email}</strong>
              </div>
              <div className="detail-row">
                <span>Phone</span>
                <strong>{selectedTech.phone || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>Joined</span>
                <strong>{new Date(selectedTech.created_at).toLocaleDateString('en-GB')}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong className={selectedTech.is_active ? 'text-green' : 'text-red'}>
                  {selectedTech.is_active ? 'Active' : 'Suspended'}
                </strong>
              </div>
            </div>
            <div className="modal-stats">
              <div className="modal-stat">
                <FaClipboardList />
                <span>Total Jobs</span>
                <strong>{selectedTech.stats.total_jobs}</strong>
              </div>
              <div className="modal-stat">
                <FaCheckSquare />
                <span>Completed</span>
                <strong className="text-green">{selectedTech.stats.jobs_completed}</strong>
              </div>
              <div className="modal-stat">
                <FaWallet />
                <span>Available</span>
                <strong className="text-green">{formatCurrency(selectedTech.stats.available_balance)}</strong>
              </div>
              <div className="modal-stat">
                <FaHourglassHalf />
                <span>Escrow</span>
                <strong className="text-yellow">{formatCurrency(selectedTech.stats.pending_escrow)}</strong>
              </div>
            </div>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicians;