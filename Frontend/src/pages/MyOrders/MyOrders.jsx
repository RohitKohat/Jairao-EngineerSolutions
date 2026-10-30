import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaShoppingBag, FaDownload, FaBox, FaHome,
  FaReceipt, FaCheckCircle, FaTruck, FaClock,
  FaTimesCircle, FaSync,
} from 'react-icons/fa';
import { orderApi } from '../../api';
import { StoreContext } from '../../context/StoreContext';
import './MyOrders.css';

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // ═══ Fetch orders ═══
  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await orderApi.getMyOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
      } else {
        toast.error('Failed to load orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ═══ Download invoice ═══
  const handleDownloadInvoice = async (orderId, orderNumber) => {
    setDownloadingId(orderId);
    try {
      const blob = await orderApi.downloadInvoice(orderId);
      const fileURL = URL.createObjectURL(
        new Blob([blob], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `invoice-${orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
      toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  // ═══ Helpers ═══
  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(n || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusMeta = (status) => {
    const map = {
      PENDING: { label: 'Pending', class: 'pending', icon: <FaClock /> },
      CONFIRMED: { label: 'Confirmed', class: 'confirmed', icon: <FaCheckCircle /> },
      PROCESSING: { label: 'Processing', class: 'processing', icon: <FaClock /> },
      DISPATCHED: { label: 'Dispatched', class: 'dispatched', icon: <FaTruck /> },
      DELIVERED: { label: 'Delivered', class: 'delivered', icon: <FaCheckCircle /> },
      CANCELLED: { label: 'Cancelled', class: 'cancelled', icon: <FaTimesCircle /> },
    };
    return map[status] || { label: status, class: 'pending', icon: <FaClock /> };
  };

  // ═══ Filter ═══
  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  // ═══ Stats ═══
  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'DISPATCHED'].includes(o.status)
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;

  // ═══ Not logged in ═══
  if (!token) {
    return (
      <div className="mo-page">
        <div className="mo-empty">
          <div className="mo-empty-icon">🔒</div>
          <h2>Please login to view your orders</h2>
          <p>Sign in to see your order history and track deliveries.</p>
          <button
            className="mo-btn primary"
            onClick={() => navigate('/')}
          >
            <FaHome /> Go to Home
          </button>
        </div>
      </div>
    );
  }

  // ═══ Loading ═══
  if (loading) {
    return (
      <div className="mo-page">
        <div className="mo-loading">
          <div className="mo-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mo-page">
      {/* Header */}
      <div className="mo-header">
        <div>
          <h1>My Orders</h1>
          <p>Track, download invoices, and manage your purchases</p>
        </div>
        <button className="mo-refresh-btn" onClick={fetchOrders} title="Refresh">
          <FaSync />
        </button>
      </div>

      {/* Stats */}
      {orders.length > 0 && (
        <div className="mo-stats">
          <div className="mo-stat-card">
            <div className="mo-stat-icon blue"><FaBox /></div>
            <div>
              <p>Total Orders</p>
              <h3>{orders.length}</h3>
            </div>
          </div>
          <div className="mo-stat-card">
            <div className="mo-stat-icon yellow"><FaTruck /></div>
            <div>
              <p>Active Orders</p>
              <h3>{activeOrders}</h3>
            </div>
          </div>
          <div className="mo-stat-card">
            <div className="mo-stat-icon green"><FaCheckCircle /></div>
            <div>
              <p>Delivered</p>
              <h3>{deliveredOrders}</h3>
            </div>
          </div>
          <div className="mo-stat-card">
            <div className="mo-stat-icon purple"><FaReceipt /></div>
            <div>
              <p>Total Spent</p>
              <h3>{formatCurrency(totalSpent)}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <div className="mo-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'PROCESSING', label: 'Processing' },
            { key: 'DISPATCHED', label: 'Dispatched' },
            { key: 'DELIVERED', label: 'Delivered' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.key}
              className={`mo-filter-btn ${filterStatus === f.key ? 'active' : ''}`}
              onClick={() => setFilterStatus(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="mo-empty">
          <div className="mo-empty-icon">📦</div>
          <h2>
            {orders.length === 0
              ? 'No orders yet'
              : 'No orders with this status'}
          </h2>
          <p>
            {orders.length === 0
              ? 'Start shopping to see your orders here.'
              : 'Try a different filter to see other orders.'}
          </p>
          <Link to="/shop" className="mo-btn primary">
            <FaShoppingBag /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="mo-list">
          {filteredOrders.map((order) => {
            const meta = getStatusMeta(order.status);
            return (
              <div key={order.id} className="mo-order-card">
                {/* Header */}
                <div className="mo-order-head">
                  <div className="mo-order-id">
                    <FaReceipt className="mo-order-id-icon" />
                    <div>
                      <strong>{order.order_number}</strong>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <span className={`mo-status ${meta.class}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mo-order-items">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="mo-item">
                        <div className="mo-item-info">
                          <span className="mo-item-name">
                            Product #{item.product_id}
                          </span>
                          <span className="mo-item-qty">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="mo-item-price">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="mo-items-more">
                        + {order.items.length - 3} more item
                        {order.items.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mo-order-foot">
                  <div className="mo-order-total">
                    <span>Total</span>
                    <strong>{formatCurrency(order.total_amount)}</strong>
                  </div>
                  <div className="mo-order-actions">
                    <button
                      className="mo-btn secondary"
                      onClick={() =>
                        handleDownloadInvoice(order.id, order.order_number)
                      }
                      disabled={downloadingId === order.id}
                    >
                      <FaDownload />
                      {downloadingId === order.id
                        ? 'Downloading...'
                        : 'Invoice'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;