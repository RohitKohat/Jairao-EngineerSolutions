import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCheckCircle, FaShoppingBag, FaDownload,
  FaTruck, FaHome, FaReceipt, FaClock,
} from 'react-icons/fa';
import { orderApi } from '../../api';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId || null;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // ═══ Fetch order details ═══
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await orderApi.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Fetch order error:', error);
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ═══ Download invoice ═══
  const handleDownloadInvoice = async () => {
    if (!orderId) {
      toast.error('Order ID missing');
      return;
    }

    setDownloading(true);
    try {
      const blob = await orderApi.downloadInvoice(orderId);
      const fileURL = URL.createObjectURL(
        new Blob([blob], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `invoice-${order?.order_number || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
      toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(n || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // ═══ No order ID (direct visit) ═══
  if (!orderId) {
    return (
      <div className="os-page">
        <div className="os-empty">
          <div className="os-empty-icon">🔍</div>
          <h2>No order to display</h2>
          <p>This page only appears after a successful checkout.</p>
          <Link to="/shop" className="os-btn primary">
            <FaShoppingBag /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ═══ Loading ═══
  if (loading) {
    return (
      <div className="os-page">
        <div className="os-loading">
          <div className="os-spinner"></div>
          <p>Loading your order...</p>
        </div>
      </div>
    );
  }

  // ═══ Success ═══
  return (
    <div className="os-page">
      <div className="os-container">
        {/* Success Animation */}
        <div className="os-success-icon">
          <FaCheckCircle />
        </div>

        <h1 className="os-title">Order Placed Successfully!</h1>
        <p className="os-subtitle">
          {"Thank you for your purchase. We've received your order and will process it shortly."}
        </p>

        {/* Order Card */}
        {order && (
          <div className="os-order-card">
            <div className="os-order-header">
              <div className="os-order-badge">
                <FaReceipt />
                <span>Order Confirmed</span>
              </div>
              <span className="os-order-status">
                {order.status || 'PENDING'}
              </span>
            </div>

            <div className="os-order-details">
              <div className="os-detail-row">
                <span className="os-detail-label">Order Number</span>
                <strong className="os-detail-value">
                  {order.order_number}
                </strong>
              </div>
              <div className="os-detail-row">
                <span className="os-detail-label">Order Date</span>
                <strong className="os-detail-value">
                  {formatDate(order.created_at)}
                </strong>
              </div>
              <div className="os-detail-row">
                <span className="os-detail-label">Total Amount</span>
                <strong className="os-detail-value os-total">
                  {formatCurrency(order.total_amount)}
                </strong>
              </div>
              <div className="os-detail-row">
                <span className="os-detail-label">Payment Status</span>
                <strong className="os-detail-value os-paid">
                  {order.payment_status || 'PENDING'}
                </strong>
              </div>
            </div>

            {/* Items Preview */}
            {order.items && order.items.length > 0 && (
              <div className="os-items">
                <h4>Items ({order.items.length})</h4>
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="os-item-row">
                    <span>Product #{item.product_id}</span>
                    <span>× {item.quantity}</span>
                    <span>{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="os-items-more">
                    + {order.items.length - 3} more item
                    {order.items.length - 3 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Delivery Info */}
            {order.address_line && (
              <div className="os-delivery">
                <FaTruck className="os-delivery-icon" />
                <div>
                  <strong>Delivering to</strong>
                  <p>
                    {[
                      order.address_line,
                      order.city,
                      order.state,
                      order.zip_code,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* What's Next */}
        <div className="os-next-steps">
          <h3>What happens next?</h3>
          <div className="os-steps-grid">
            <div className="os-step-card">
              <div className="os-step-icon">
                <FaClock />
              </div>
              <h4>Order Processing</h4>
              <p>{"We'll confirm your order within 24 hours"}</p>
            </div>
            <div className="os-step-card">
              <div className="os-step-icon">
                <FaTruck />
              </div>
              <h4>Shipping</h4>
              <p>Your items will be dispatched soon</p>
            </div>
            <div className="os-step-card">
              <div className="os-step-icon">
                <FaCheckCircle />
              </div>
              <h4>Delivery</h4>
              <p>Track your order until it arrives</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="os-actions">
          <button
            className="os-btn primary"
            onClick={handleDownloadInvoice}
            disabled={downloading}
          >
            <FaDownload />
            {downloading ? 'Downloading...' : 'Download Invoice'}
          </button>

          <button
            className="os-btn secondary"
            onClick={() => navigate('/myorders')}
          >
            <FaShoppingBag /> View My Orders
          </button>

          <Link to="/shop" className="os-btn tertiary">
            <FaHome /> Continue Shopping
          </Link>
        </div>

        {/* Footer */}
        <p className="os-footer">
          A confirmation email has been sent to your registered email address.
          <br />
          For any queries, contact our support team.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;