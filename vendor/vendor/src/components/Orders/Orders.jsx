import { useState } from 'react';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';

const Orders = () => {
  // Mock orders (replace with API: GET /api/vendor/orders)
  const [orders] = useState([
    { id: '#ORD-101', product: 'Samsung 1.5 Ton AC', customer: 'John Doe', date: '15 Jan 2025', amount: 45000, vendorShare: 40500, status: 'Processing' },
    { id: '#ORD-102', product: 'LG Washing Machine', customer: 'Jane Smith', date: '14 Jan 2025', amount: 32000, vendorShare: 28800, status: 'Shipped' },
    { id: '#ORD-103', product: 'Godrej Refrigerator', customer: 'Mike Johnson', date: '13 Jan 2025', amount: 28000, vendorShare: 25200, status: 'Delivered' },
    { id: '#ORD-104', product: 'Voltas Air Cooler', customer: 'Sarah Lee', date: '12 Jan 2025', amount: 8000, vendorShare: 7200, status: 'Delivered' },
    { id: '#ORD-105', product: 'Kent Water Purifier', customer: 'Raj Patel', date: '11 Jan 2025', amount: 15000, vendorShare: 13500, status: 'Cancelled' },
  ]);

  const [search, setSearch] = useState('');

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'badge-completed';
      case 'shipped': return 'badge-shipped';
      case 'processing': return 'badge-pending';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track orders placed for your products and view your escrow earnings</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaShoppingCart className="table-title-icon" />
            <h2>All Orders ({filtered.length})</h2>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', fontSize: 14 }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '10px 16px 10px 38px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none',
                width: '240px',
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Your Share (90%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-state">No orders found.</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id}>
                    <td className="font-semibold">{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.customer}</td>
                    <td className="text-muted">{order.date}</td>
                    <td className="font-bold">{formatCurrency(order.amount)}</td>
                    <td className="text-green font-bold">{formatCurrency(order.vendorShare)}</td>
                    <td>
                      <span className={`badge ${getStatusClass(order.status)}`}>
                        {order.status}
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

export default Orders;