import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { cartItems, product_list, token, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═══ Load Razorpay script ═══
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ═══ Calculate totals ═══
  const cartEntries = Object.entries(cartItems).filter(([, qty]) => qty > 0);

  let subtotal = 0;
  let gstAmount = 0;
  let totalDiscount = 0;

  cartEntries.forEach(([itemId, qty]) => {
    const item = product_list.find((i) => String(i.id) === String(itemId));
    if (item) {
      const finalPrice = item.final_price || item.price || 0;
      const basePrice = item.price || 0;
      subtotal += finalPrice * qty;
      totalDiscount += (basePrice - finalPrice) * qty;

      const category = (item.category || '').toLowerCase();
      const gstRate =
        category.includes('ac') || category.includes('air-conditioner') ? 0.28 : 0.18;
      gstAmount += finalPrice * qty * gstRate;
    }
  });

  const deliveryFee = subtotal > 0 ? 2 : 0;
  const totalAmount = subtotal + gstAmount + deliveryFee;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  // ═══ Place order ═══
  const placeOrder = async (event) => {
    event.preventDefault();

    if (cartEntries.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!token) {
      toast.error('Please login to place order');
      navigate('/');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create order in backend
      const orderPayload = {
        items: cartEntries.map(([itemId, qty]) => ({
          product_id: Number(itemId),
          quantity: qty,
        })),
        address_line: `${data.street}`,
        city: data.city,
        state: data.state,
        zip_code: data.zipcode,
        country: data.country,
        phone: data.phone,
      };

      const orderRes = await axios.post(`${url}/api/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderId = orderRes.data.id;
      const orderNumber = orderRes.data.order_number;
      toast.success(`Order ${orderNumber} created!`);

      // Step 2: Handle payment
      if (paymentMethod === 'Razorpay') {
        await handleRazorpay(orderId, orderNumber);
      } else if (paymentMethod === 'COD') {
        await handleCOD(orderId, orderNumber);
      } else if (paymentMethod === 'Finance') {
        await handleFinance(orderId, orderNumber);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══ Razorpay payment ═══
  const handleRazorpay = async (orderId, orderNumber) => {
    try {
      // Step 1: Create Razorpay order
      const rzRes = await axios.post(
        `${url}/api/payments/razorpay/create-order`,
        { order_id: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 2: Open Razorpay checkout
      const options = {
        key: rzRes.data.razorpay_key_id,
        amount: rzRes.data.amount * 100,
        currency: rzRes.data.currency,
        name: 'Jairao EngineerSolutions',
        description: `Order ${orderNumber}`,
        order_id: rzRes.data.razorpay_order_id,
        prefill: {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          contact: data.phone,
        },
        theme: { color: '#3b82f6' },
        handler: async (response) => {
          // Step 3: Verify payment signature
          try {
            await axios.post(
              `${url}/api/payments/razorpay/verify`,
              {
                order_id: orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Payment successful!');
            navigate('/order-success', { state: { orderId } });
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            toast.warning('Payment cancelled');
            navigate('/order-success', { state: { orderId } });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Razorpay failed');
    }
  };

  // ═══ COD payment ═══
  const handleCOD = async (orderId, orderNumber) => {
    try {
      await axios.post(
        `${url}/api/payments/cod`,
        { order_id: orderId, notes: 'Cash on Delivery' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order ${orderNumber} placed! Pay cash on delivery.`);
      navigate('/order-success', { state: { orderId } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'COD failed');
    }
  };

  // ═══ Finance payment ═══
  const handleFinance = async (orderId, orderNumber) => {
    try {
      await axios.post(
        `${url}/api/payments/finance`,
        {
          order_id: orderId,
          finance_provider: 'HDFC',
          emi_tenure_months: 6,
          notes: 'EMI Plan',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order ${orderNumber} placed with EMI!`);
      navigate('/order-success', { state: { orderId } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Finance failed');
    }
  };

  return (
    <div className="place-order-page">
      <div className="place-order-header">
        <h1>Checkout</h1>
        <p>Complete your order in just a few steps</p>
      </div>

      <form onSubmit={placeOrder} className="place-order">
        {/* LEFT: Delivery */}
        <div className="place-order-left">
          <div className="section-header">
            <span className="section-icon">📍</span>
            <h2 className="title">Delivery Information</h2>
          </div>

          <div className="multi-field">
            <div className="input-group">
              <label>First Name</label>
              <input
                required
                name="firstName"
                onChange={onChangeHandler}
                value={data.firstName}
                type="text"
                placeholder="John"
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                required
                name="lastName"
                onChange={onChangeHandler}
                value={data.lastName}
                type="text"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              required
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="john@example.com"
            />
          </div>

          <div className="input-group">
            <label>Street Address</label>
            <input
              required
              name="street"
              onChange={onChangeHandler}
              value={data.street}
              type="text"
              placeholder="123 Main Street, Apt 4B"
            />
          </div>

          <div className="multi-field">
            <div className="input-group">
              <label>City</label>
              <input
                required
                name="city"
                onChange={onChangeHandler}
                value={data.city}
                type="text"
                placeholder="Mumbai"
              />
            </div>
            <div className="input-group">
              <label>State</label>
              <input
                required
                name="state"
                onChange={onChangeHandler}
                value={data.state}
                type="text"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="multi-field">
            <div className="input-group">
              <label>Zip Code</label>
              <input
                required
                name="zipcode"
                onChange={onChangeHandler}
                value={data.zipcode}
                type="text"
                placeholder="400001"
              />
            </div>
            <div className="input-group">
              <label>Country</label>
              <input
                required
                name="country"
                onChange={onChangeHandler}
                value={data.country}
                type="text"
                placeholder="India"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              required
              name="phone"
              onChange={onChangeHandler}
              value={data.phone}
              type="tel"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* RIGHT: Summary + Payment */}
        <div className="place-order-right">
          <div className="section-header">
            <span className="section-icon">🧾</span>
            <h2 className="title">Order Summary</h2>
          </div>

          <div className="cart-total">
            <div className="cart-summary-rows">
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>₹{subtotal.toFixed(2)}</p>
              </div>

              {totalDiscount > 0 && (
                <div className="cart-total-details discount-row">
                  <p>You Save</p>
                  <p>−₹{totalDiscount.toFixed(2)}</p>
                </div>
              )}

              <div className="cart-total-details">
                <p>GST</p>
                <p>₹{gstAmount.toFixed(2)}</p>
              </div>

              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>₹{deliveryFee.toFixed(2)}</p>
              </div>

              <div className="cart-total-details cart-grand-total">
                <p>Total Amount</p>
                <p>₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="payment-method">
            <p className="payment-label">Select Payment Method</p>
            <div className="payment-buttons">
              <button
                type="button"
                className={`payment-btn ${paymentMethod === 'Razorpay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Razorpay')}
              >
                <span className="payment-icon">💳</span>
                <div>
                  <strong>Pay Online</strong>
                  <small>UPI, Cards, Netbanking</small>
                </div>
              </button>
              <button
                type="button"
                className={`payment-btn ${paymentMethod === 'COD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <span className="payment-icon">💵</span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when delivered</small>
                </div>
              </button>
              <button
                type="button"
                className={`payment-btn ${paymentMethod === 'Finance' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Finance')}
              >
                <span className="payment-icon">🏦</span>
                <div>
                  <strong>EMI / Finance</strong>
                  <small>Pay in installments</small>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="place-order-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;