import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCreditCard, FaMoneyBillWave, FaUniversity, FaShoppingBag,
  FaMapMarkerAlt, FaCheckCircle, FaLock, FaArrowLeft,
} from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';
import { orderApi, paymentApi } from '../../api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems = {}, product_list = [], token, clearCart } = useContext(StoreContext);

  // ═══ Build cart array from location state OR StoreContext ═══
  const getCartArray = () => {
    // Priority 1: Location state (from Cart page)
    if (location.state?.cartItems?.length > 0) {
      return location.state.cartItems;
    }

    // Priority 2: StoreContext (global cart)
    return Object.entries(cartItems)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = product_list.find((p) => String(p.id) === String(id));
        if (!product) return null;
        return { ...product, quantity: qty };
      })
      .filter(Boolean);
  };

  const cart = getCartArray();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  const [address, setAddress] = useState({
    address_line: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    phone: '',
  });

  const [financeData, setFinanceData] = useState({
    finance_provider: 'HDFC',
    emi_tenure_months: 6,
  });

  // ═══ Load Razorpay script ═══
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ═══ Redirect if cart empty ═══
  useEffect(() => {
    if (cart.length === 0) {
      toast.warning('Your cart is empty');
      setTimeout(() => navigate('/cart'), 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══ Calculate totals ═══
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.final_price || item.price || 0) * item.quantity,
    0
  );

  const gstAmount = cart.reduce((sum, item) => {
    const category = (item.category || '').toLowerCase();
    const rate =
      category.includes('ac') || category.includes('air-conditioner') ? 0.28 : 0.18;
    return sum + (item.final_price || item.price || 0) * item.quantity * rate;
  }, 0);

  const deliveryFee = subtotal > 0 ? 2 : 0;
  const total = Math.round((subtotal + gstAmount + deliveryFee) * 100) / 100;

  // ═══ Address change ═══
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // ═══ Step 1: Create Order ═══
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!token) {
      toast.warning('Please login to place order');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cart.map((item) => ({
          product_id: Number(item.id),
          quantity: item.quantity,
        })),
        address_line: address.address_line,
        city: address.city,
        state: address.state || null,
        zip_code: address.zip_code || null,
        country: address.country || 'India',
        phone: address.phone,
      };

      const order = await orderApi.createOrder(orderPayload);
      setOrderId(order.id);
      setOrderNumber(order.order_number);
      setStep(2);
      toast.success(`Order ${order.order_number} created!`);
    } catch (error) {
      console.error('Create order error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  // ═══ Step 2A: Razorpay ═══
  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const rzOrder = await paymentApi.createRazorpayOrder(orderId);

      const options = {
        key: rzOrder.razorpay_key_id,
        amount: rzOrder.amount * 100,
        currency: rzOrder.currency,
        name: 'Jairao EngineerSolutions',
        description: `Order ${rzOrder.order_number}`,
        order_id: rzOrder.razorpay_order_id,
        prefill: {
          name: 'Customer',
          contact: address.phone,
        },
        theme: { color: '#3b82f6' },
        handler: async (response) => {
          try {
            await paymentApi.verifyRazorpayPayment({
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success('Payment successful!');
            if (clearCart) clearCart();

            setTimeout(() => {
              navigate('/order-success', { state: { orderId } });
            }, 500);
          } catch (err) {
            console.error('Verify error:', err);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.warning('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error(error.response?.data?.detail || 'Razorpay failed');
      setLoading(false);
    }
  };

  // ═══ Step 2B: COD ═══
  const handleCODPayment = async () => {
    setLoading(true);
    try {
      await paymentApi.createCODPayment(orderId, 'Cash on Delivery');
      toast.success('Order placed! Pay cash on delivery.');
      if (clearCart) clearCart();

      setTimeout(() => {
        navigate('/order-success', { state: { orderId } });
      }, 500);
    } catch (error) {
      console.error('COD error:', error);
      toast.error(error.response?.data?.detail || 'COD failed');
    } finally {
      setLoading(false);
    }
  };

  // ═══ Step 2C: Finance / EMI ═══
  const handleFinancePayment = async () => {
    setLoading(true);
    try {
      await paymentApi.createFinancePayment(
        orderId,
        financeData.finance_provider,
        financeData.emi_tenure_months,
        `EMI via ${financeData.finance_provider}`
      );
      toast.success('Finance approved! Order placed.');
      if (clearCart) clearCart();

      setTimeout(() => {
        navigate('/order-success', { state: { orderId } });
      }, 500);
    } catch (error) {
      console.error('Finance error:', error);
      toast.error(error.response?.data?.detail || 'Finance failed');
    } finally {
      setLoading(false);
    }
  };

  // ═══ Payment submit ═══
  const handlePaymentSubmit = () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (paymentMethod === 'razorpay') handleRazorpayPayment();
    if (paymentMethod === 'cod') handleCODPayment();
    if (paymentMethod === 'finance') handleFinancePayment();
  };

  // ═══ EMI preview ═══
  const emiPreview =
    financeData.emi_tenure_months > 0
      ? Math.round((total / financeData.emi_tenure_months) * 100) / 100
      : 0;

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  // ═══ Empty cart ═══
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to proceed with checkout.</p>
          <button onClick={() => navigate('/shop')} className="checkout-btn primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <div className="checkout-header">
        <button
          type="button"
          className="checkout-back-btn"
          onClick={() => navigate('/cart')}
        >
          <FaArrowLeft /> Back to Cart
        </button>
        <h1>Checkout</h1>
        <p>Complete your order in 2 easy steps</p>
      </div>

      {/* Progress Steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Address</span>
        </div>
        <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Payment</span>
        </div>
      </div>

      <div className="checkout-grid">
        {/* ═══ MAIN ═══ */}
        <div className="checkout-main">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <div className="checkout-card">
              <div className="checkout-card-header">
                <FaMapMarkerAlt />
                <h2>Delivery Address</h2>
              </div>
              <form onSubmit={handleAddressSubmit} className="checkout-form">
                <div className="form-field">
                  <label>Address Line *</label>
                  <input
                    name="address_line"
                    value={address.address_line}
                    onChange={handleAddressChange}
                    placeholder="Street, building, apartment"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>City *</label>
                    <input
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>State</label>
                    <input
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>ZIP Code</label>
                    <input
                      name="zip_code"
                      value={address.zip_code}
                      onChange={handleAddressChange}
                      placeholder="400001"
                    />
                  </div>
                  <div className="form-field">
                    <label>Country</label>
                    <input
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                      placeholder="India"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Phone Number *</label>
                  <input
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="checkout-btn primary"
                  disabled={loading}
                >
                  {loading ? 'Creating Order...' : 'Continue to Payment →'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <div className="checkout-card">
              <div className="checkout-card-header">
                <FaCreditCard />
                <h2>Payment Method</h2>
              </div>

              <div className="order-badge">
                <FaLock /> Order <strong>{orderNumber}</strong> created
              </div>

              {/* Razorpay */}
              <div
                className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <div className="payment-icon razorpay">
                  <FaCreditCard />
                </div>
                <div className="payment-info">
                  <h4>Pay Online</h4>
                  <p>Credit/Debit Card, UPI, Netbanking, Wallet</p>
                </div>
                <div className="payment-radio">
                  <input
                    type="radio"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                </div>
              </div>

              {/* COD */}
              <div
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="payment-icon cod">
                  <FaMoneyBillWave />
                </div>
                <div className="payment-info">
                  <h4>Cash on Delivery</h4>
                  <p>Pay when you receive the product</p>
                </div>
                <div className="payment-radio">
                  <input
                    type="radio"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                </div>
              </div>

              {/* Finance */}
              <div
                className={`payment-option ${paymentMethod === 'finance' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('finance')}
              >
                <div className="payment-icon finance">
                  <FaUniversity />
                </div>
                <div className="payment-info">
                  <h4>Finance / EMI</h4>
                  <p>Pay in easy monthly installments</p>
                </div>
                <div className="payment-radio">
                  <input
                    type="radio"
                    checked={paymentMethod === 'finance'}
                    onChange={() => setPaymentMethod('finance')}
                  />
                </div>
              </div>

              {/* EMI Panel */}
              {paymentMethod === 'finance' && (
                <div className="emi-panel">
                  <h4>EMI Details</h4>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Finance Provider</label>
                      <select
                        value={financeData.finance_provider}
                        onChange={(e) =>
                          setFinanceData({ ...financeData, finance_provider: e.target.value })
                        }
                      >
                        <option value="HDFC">HDFC Bank</option>
                        <option value="Bajaj">Bajaj Finserv</option>
                        <option value="ZestMoney">ZestMoney</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="Kotak">Kotak Mahindra</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Tenure (Months)</label>
                      <select
                        value={financeData.emi_tenure_months}
                        onChange={(e) =>
                          setFinanceData({
                            ...financeData,
                            emi_tenure_months: Number(e.target.value),
                          })
                        }
                      >
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={9}>9 Months</option>
                        <option value={12}>12 Months</option>
                        <option value={18}>18 Months</option>
                        <option value={24}>24 Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="emi-preview">
                    <p>Monthly EMI:</p>
                    <h3>
                      {formatCurrency(emiPreview)} × {financeData.emi_tenure_months} months
                    </h3>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="payment-actions">
                <button
                  type="button"
                  className="checkout-btn secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="checkout-btn primary"
                  onClick={handlePaymentSubmit}
                  disabled={loading || !paymentMethod}
                >
                  {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ SUMMARY SIDEBAR ═══ */}
        <div className="checkout-summary">
          <div className="summary-card">
            <div className="summary-header">
              <FaShoppingBag />
              <h3>Order Summary</h3>
            </div>

            <div className="summary-items">
              {cart.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="summary-item-price">
                    {formatCurrency((item.final_price || item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>GST</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free">
                  {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="summary-footer">
              <FaCheckCircle /> Secure payment · 100% safe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;