import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaStore, FaSearch, FaBan, FaCheckCircle, FaBox,
  FaShoppingCart, FaWallet, FaHourglassHalf, FaEye,
} from 'react-icons/fa';
import api from '../../api/api';
import './Vendors.css';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchVendors = async () => {
    try {
      const { data } = await api.get('/api/admin/vendors?limit=100');
      setVendors(data.vendors || []);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const toggleStatus = async (vendor) => {
    const action = vendor.is_active ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${vendor.name}?`)) return;

    try {
      await api.put(`/api/admin/users/${vendor.id}/toggle-status`);
      toast.success(`${vendor.name} ${action}d successfully`);
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    }
  };

  const openDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const filteredVendors = vendors.filter((v) => {
    const term = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      v.email.toLowerCase().includes(term) ||
      (v.company || '').toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <p style={{ padding: 40, textAlign: 'center' }}>Loading vendors...</p>;
  }

  return (
    <div className="vendors-page">
      <div className="vendors-header">
        <div className="vendors-header-icon"><FaStore /></div>
        <div>
          <h2>Vendors Management</h2>
          <p>{vendors.length} vendors registered on the platform</p>
        </div>
      </div>

      <div className="vendors-card">
        <div className="vendors-card-top">
          <h3>All Vendors ({filteredVendors.length})</h3>
          <div className="vendors-search">
            <FaSearch className="vendors-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="vendors-table-wrap">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Contact</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Total Sales</th>
                <th>Available</th>
                <th>Escrow</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr><td colSpan={9} className="vendors-empty">No vendors found.</td></tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div className="vendor-cell">
                        <strong>{vendor.name}</strong>
                        {vendor.company && (
                          <span className="vendor-company">{vendor.company}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-muted">
                      <div>{vendor.email}</div>
                      <div>{vendor.phone || '—'}</div>
                    </td>
                    <td>{vendor.stats.products_count}</td>
                    <td>{vendor.stats.total_orders}</td>
                    <td className="font-bold">{formatCurrency(vendor.stats.total_sales)}</td>
                    <td className="text-green font-bold">
                      {formatCurrency(vendor.stats.available_balance)}
                    </td>
                    <td className="text-yellow font-bold">
                      {formatCurrency(vendor.stats.pending_escrow)}
                    </td>
                    <td>
                      <span className={`badge ${vendor.is_active ? 'badge-active' : 'badge-suspended'}`}>
                        {vendor.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="vendors-actions">
                      <button
                        className="btn-icon btn-icon-primary"
                        onClick={() => openDetails(vendor)}
                        title="View details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className={`btn-status ${vendor.is_active ? 'danger' : 'success'}`}
                        onClick={() => toggleStatus(vendor)}
                      >
                        {vendor.is_active
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

      {/* Details Modal */}
      {showModal && selectedVendor && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon"><FaStore /></div>
              <h3>{selectedVendor.name}</h3>
              <p>{selectedVendor.company || 'Vendor'}</p>
            </div>
            <div className="modal-details">
              <div className="detail-row">
                <span>Email</span>
                <strong>{selectedVendor.email}</strong>
              </div>
              <div className="detail-row">
                <span>Phone</span>
                <strong>{selectedVendor.phone || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>Joined</span>
                <strong>{new Date(selectedVendor.created_at).toLocaleDateString('en-GB')}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong className={selectedVendor.is_active ? 'text-green' : 'text-red'}>
                  {selectedVendor.is_active ? 'Active' : 'Suspended'}
                </strong>
              </div>
            </div>
            <div className="modal-stats">
              <div className="modal-stat">
                <FaBox />
                <span>Products</span>
                <strong>{selectedVendor.stats.products_count}</strong>
              </div>
              <div className="modal-stat">
                <FaShoppingCart />
                <span>Orders</span>
                <strong>{selectedVendor.stats.total_orders}</strong>
              </div>
              <div className="modal-stat">
                <FaWallet />
                <span>Available</span>
                <strong className="text-green">{formatCurrency(selectedVendor.stats.available_balance)}</strong>
              </div>
              <div className="modal-stat">
                <FaHourglassHalf />
                <span>Escrow</span>
                <strong className="text-yellow">{formatCurrency(selectedVendor.stats.pending_escrow)}</strong>
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

export default Vendors;