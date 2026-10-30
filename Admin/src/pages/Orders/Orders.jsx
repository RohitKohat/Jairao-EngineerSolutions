import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  FaShoppingCart, FaSearch, FaEye, FaSync,
  FaCheckCircle, FaTruck, FaTimes, FaClipboardList,
  FaBoxOpen,
} from 'react-icons/fa';
import api from '../../api/api';
import './Orders.css';

const ORDERS_PER_PAGE = 10;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const { data } = await api.get('/api/orders/all', { params });
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    return new Date(dateValue).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    const map = {
      PENDING: 'badge-pending',
      CONFIRMED: 'badge-shipped',
      PROCESSING: 'badge-pending',
      DISPATCHED: 'badge-shipped',
      DELIVERED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  };

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(term) ||
      String(o.id).includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE
  );

  return (
    <div className="order">
      <div className="order-header">
        <div className="order-header-icon">
          <FaShoppingCart />
        </div>
        <div>
          <h2>Order & Escrow Management</h2>
          <p>View all orders, manage status, and monitor escrow</p>
        </div>
      </div>

      <div className="order-card">
        <div className="order-card-top">
          <div className="order-card-title">
            <span className="order-card-icon"><FaClipboardList /></span>
            <div>
              <h3>All Orders</h3>
              <p>{filtered.length} order{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          <div className="order-filters">
            <div className="order-search">
              <FaSearch className="order-search-icon" />
              <input
                type="text"
                placeholder="Search by order # or ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="order-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="order-refresh-btn" onClick={fetchOrders} title="Refresh">
              <FaSync />
            </button>
          </div>
        </div>

        <div className="order-table-wrap">
          {loading ? (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading orders...
            </p>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="order-empty">No orders found.</td></tr>
                ) : (
                  paginated.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id-cell">{order.order_number}</td>
                      <td>Customer #{order.customer_id}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td className="font-bold">{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="order-view-btn"
                          onClick={() => openDetails(order)}
                          title="View details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="order-footer">
          <p className="order-showing">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * ORDERS_PER_PAGE + 1}
            {' '}to {Math.min(safePage * ORDERS_PER_PAGE, filtered.length)}
            {' '}of {filtered.length} orders
          </p>
          <div className="order-pagination">
            <button disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === safePage ? 'active' : ''}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon"><FaBoxOpen /></div>
              <h3>Order {selectedOrder.order_number}</h3>
              <p>ID: #{selectedOrder.id}</p>
            </div>

            <div className="modal-details">
              <div className="detail-row">
                <span>Customer ID</span>
                <strong>#{selectedOrder.customer_id}</strong>
              </div>
              <div className="detail-row">
                <span>Date</span>
                <strong>{formatDate(selectedOrder.created_at)}</strong>
              </div>
              <div className="detail-row">
                <span>Phone</span>
                <strong>{selectedOrder.phone || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>Delivery Address</span>
                <strong>
                  {[selectedOrder.address_line, selectedOrder.city, selectedOrder.state, selectedOrder.zip_code]
                    .filter(Boolean).join(', ')}
                </strong>
              </div>
            </div>

            {/* Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="modal-items">
                <h4>Items</h4>
                <table className="modal-items-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((it) => (
                      <tr key={it.id}>
                        <td>#{it.product_id}</td>
                        <td>{it.quantity}</td>
                        <td>{formatCurrency(it.unit_price)}</td>
                        <td className="font-bold">{formatCurrency(it.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-total">
              <span>Total Amount</span>
              <strong className="text-green">{formatCurrency(selectedOrder.total_amount)}</strong>
            </div>

            {/* Status Update */}
            <div className="modal-status-update">
              <label>Update Status:</label>
              <div className="status-buttons">
                {['CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                    onClick={() => {
                      updateStatus(selectedOrder.id, status);
                      setShowModal(false);
                    }}
                  >
                    {status === 'DELIVERED' && <FaTruck />}
                    {status === 'CANCELLED' && <FaTimes />}
                    {status === 'CONFIRMED' && <FaCheckCircle />}
                    {status}
                  </button>
                ))}
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

Orders.propTypes = {
  url: PropTypes.string,
};

export default Orders;