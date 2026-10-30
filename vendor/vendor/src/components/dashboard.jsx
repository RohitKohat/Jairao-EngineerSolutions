import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaWallet, FaHourglassHalf, FaChartLine, FaShoppingCart,
  FaBoxOpen, FaRupeeSign,
} from 'react-icons/fa';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [barLabels, setBarLabels] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieLabels, setPieLabels] = useState([]);
  const [pieData, setPieData] = useState([]);

  // Wallet stats (mock — replace with real API: /api/vendor/wallet)
  const [wallet] = useState({
    availableBalance: 24500,
    pendingEscrow: 8500,
    totalSales: 123000,
    totalOrders: 0,
  });

  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/order/vendororders',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback demo orders
      setOrders([
        { _id: 'ORD-101', status: 'Delivered', address: { street: '123 Main St', city: 'Mumbai', zip: '400001', country: 'India' }, payment: true, paymentMethod: 'Online', date: new Date() },
        { _id: 'ORD-102', status: 'Product Processing', address: { street: '456 Oak Ave', city: 'Pune', zip: '411001', country: 'India' }, payment: true, paymentMethod: 'Cash', date: new Date() },
      ]);
    }
  };

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [lineRes, barRes, pieRes] = await Promise.all([
        axios.get('http://localhost:3000/api/charts/line-chart', { headers }),
        axios.get('http://localhost:3000/api/charts/bar-chart', { headers }),
        axios.get('http://localhost:3000/api/charts/pie-chart', { headers }),
      ]);

      if (lineRes.data.success) setLineData(lineRes.data.data.salesData);
      if (barRes.data.success) {
        setBarLabels(barRes.data.data.categories.map((l) => l || 'Uncategorized'));
        setBarData(barRes.data.data.salesData);
      }
      if (pieRes.data.success) {
        setPieLabels(pieRes.data.data.labels);
        setPieData(pieRes.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Fallback demo chart data
      setLineData([12, 19, 8, 15, 22, 30, 45, 38, 28, 20, 15, 25]);
      setBarLabels(['AC', 'Fridge', 'Washing Machine', 'Cooler']);
      setBarData([45, 32, 28, 15]);
      setPieLabels(['Available', 'Sold Out']);
      setPieData([70, 30]);
    }
  };

  const destroyCharts = () => {
    lineChartRef.current?.destroy();
    barChartRef.current?.destroy();
    pieChartRef.current?.destroy();
  };

  const renderCharts = () => {
    destroyCharts();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#f8fafc';
    const gridColor = 'rgba(148, 163, 184, 0.1)';

    const lineCtx = document.getElementById('lineChart');
    const barCtx = document.getElementById('barChart');
    const pieCtx = document.getElementById('pieChart');

    if (lineCtx) {
      lineChartRef.current = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Monthly Sales',
            data: lineData,
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor } } },
          scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
          },
        },
      });
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

    if (barCtx) {
      barChartRef.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: barLabels,
          datasets: [{
            label: 'Sales by Category',
            data: barData,
            backgroundColor: barLabels.map((_, i) => colors[i % colors.length]),
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor } } },
          scales: {
            y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
          },
        },
      });
    }

    if (pieCtx) {
      pieChartRef.current = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: pieLabels,
          datasets: [{
            data: pieData,
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, padding: 16 },
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchChartData();
  }, []);

  useEffect(() => {
    if (lineData.length || barData.length || pieData.length) {
      renderCharts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineData, barLabels, barData, pieLabels, pieData]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-completed';
      case 'Dispatched': return 'badge-shipped';
      case 'Order Confirmed': return 'badge-shipped';
      case 'Product Processing': return 'badge-pending';
      case 'Canceled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.post('http://localhost:3000/api/order/status', {
        orderId,
        status: newStatus,
      });
      if (res.data.success) {
        toast.success('Order status updated');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status', error);
      toast.error('Failed to update status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/order/delete',
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Welcome back, Vendor 👋</h1>
        <p>Track your sales, orders, and escrow earnings at a glance</p>
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
          <div className="stat-icon icon-blue"><FaChartLine /></div>
          <div className="stat-info">
            <p>Total Sales</p>
            <h3>{formatCurrency(wallet.totalSales)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple"><FaShoppingCart /></div>
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{orders.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Monthly Sales</h3>
          </div>
          <div className="chart-body">
            <canvas id="lineChart"></canvas>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <FaBoxOpen className="chart-icon" />
            <h3>Sales by Category</h3>
          </div>
          <div className="chart-body">
            <canvas id="barChart"></canvas>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <FaRupeeSign className="chart-icon" />
            <h3>Availability</h3>
          </div>
          <div className="chart-body chart-body-doughnut">
            <canvas id="pieChart"></canvas>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaShoppingCart className="table-title-icon" />
            <h2>Recent Orders</h2>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Status</th>
                <th>Location</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">No orders found.</td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order._id || index}>
                    <td className="font-semibold">{order._id}</td>
                    <td>
                      <select
                        className={`status-select ${getStatusClass(order.status)}`}
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option value="Product Processing">Product Processing</option>
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </td>
                    <td className="text-muted">
                      {order.address
                        ? `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.zip || ''}, ${order.address.country || ''}`
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${order.payment ? 'badge-completed' : 'badge-pending'}`}>
                        {order.payment ? 'Paid' : 'Unpaid'} ({order.paymentMethod})
                      </span>
                    </td>
                    <td>{new Date(order.date).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteOrder(order._id)}
                      >
                        Delete
                      </button>
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