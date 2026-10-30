import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './Cart.css';

const Cart = () => {
  const {
    cartItems = {},
    product_list = [],
    removeFromCart,
    addToCart,
    url,
    token,
  } = useContext(StoreContext) || {};

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const navigate = useNavigate();

  // ═══ Currency formatter ═══
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);

  // ═══ Get image URL ═══
  const getImageUrl = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${url}${image}`;
  };

  // ═══ Is cart empty? ═══
  const isCartEmpty = Object.keys(cartItems).length === 0;

  // ═══ Calculate cart totals ═══
  let subtotal = 0;
  let totalDiscount = 0;
  let gstSummary = {};

  Object.entries(cartItems).forEach(([itemId, quantity]) => {
    const item = product_list.find((i) => String(i.id) === String(itemId));
    if (item) {
      const finalPrice = item.final_price || item.price || 0;
      const basePrice = item.price || 0;
      const itemSubtotal = finalPrice * quantity;
      const discountAmount = (basePrice - finalPrice) * quantity;

      subtotal += itemSubtotal;
      totalDiscount += discountAmount;

      // GST calculation based on category
      const category = (item.category || '').toLowerCase();
      const gstRate =
        category.includes('ac') || category.includes('air-conditioner') ? 0.28 : 0.18;
      const gstAmount = itemSubtotal * gstRate;
      const gstLabel = `${Math.round(gstRate * 100)}%`;

      gstSummary[gstLabel] = (gstSummary[gstLabel] || 0) + gstAmount;
    }
  });

  const gstAmount = Object.values(gstSummary).reduce((acc, val) => acc + val, 0);
  const deliveryFee = isCartEmpty ? 0 : 2;
  const total = subtotal + gstAmount + deliveryFee;

  // ═══ Promo code handler ═══
  const handlePromoSubmit = () => {
    if (promoCode.trim().toLowerCase() === 'save10') {
      setPromoApplied(true);
      alert('Promo code SAVE10 applied! (Discount logic not implemented yet.)');
    } else {
      alert('Invalid promo code. Try SAVE10');
    }
  };

  // ═══ Proceed to Checkout ═══
  const handleProceedToCheckout = () => {
    if (isCartEmpty) {
      alert('Your cart is empty');
      return;
    }

    if (!token) {
      alert('Please login to proceed with checkout');
      navigate('/');
      return;
    }

    // Build cart array from cartItems + product_list
    const cartArray = product_list
      .map((item) => {
        const qty = cartItems[item.id];
        if (!qty || qty <= 0) return null;
        return { ...item, quantity: qty };
      })
      .filter(Boolean);

    // Navigate to checkout with cart state
    navigate('/checkout', { state: { cartItems: cartArray } });
  };

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* ═══ EMPTY CART STATE ═══ */}
        {isCartEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet. Start shopping!</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/shop')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* ═══ CART ITEMS TABLE ═══ */}
            <div className="cart-items">
              <div className="cart-items-title">
                <p>Item</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
              </div>

              {product_list.map((item) => {
                const quantity = cartItems[item.id];
                if (!quantity || quantity <= 0) return null;

                const finalPrice = item.final_price || item.price || 0;

                return (
                  <div key={item.id} className="cart-items-item">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <p className="item-name">{item.name}</p>
                    <p className="item-price">{formatCurrency(finalPrice)}</p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <p>{quantity}</p>
                      <button
                        type="button"
                        onClick={() => addToCart(item.id)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <p className="item-total">
                      {formatCurrency(finalPrice * quantity)}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="cart-remove-btn"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ═══ CART BOTTOM: TOTAL + PROMO ═══ */}
            <div className="cart-bottom">

              {/* Order Summary */}
              <div className="cart-total">
                <h2>Order Summary</h2>
                <div className="cart-summary-rows">
                  <div className="cart-total-details">
                    <p>Subtotal</p>
                    <p>{formatCurrency(subtotal)}</p>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="cart-total-details">
                      <p>You Save</p>
                      <p style={{ color: '#10b981' }}>
                        −{formatCurrency(totalDiscount)}
                      </p>
                    </div>
                  )}

                  {Object.entries(gstSummary).map(([rate, amount]) => (
                    <div key={rate} className="cart-total-details">
                      <p>GST ({rate})</p>
                      <p>{formatCurrency(amount)}</p>
                    </div>
                  ))}

                  <div className="cart-total-details">
                    <p>Delivery Fee</p>
                    <p>{formatCurrency(deliveryFee)}</p>
                  </div>

                  <div className="cart-total-details cart-grand-total">
                    <p>Grand Total</p>
                    <p>{formatCurrency(total)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  onClick={handleProceedToCheckout}
                  disabled={isCartEmpty}
                >
                  Proceed to Checkout →
                </button>
              </div>

              {/* Promo Code */}
              <div className="cart-promocode">
                <h3>Have a promo code?</h3>
                <p>Enter your code below to unlock extra savings.</p>
                <div className="cart-promocode-input">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <button
                    type="button"
                    onClick={handlePromoSubmit}
                    disabled={promoApplied}
                  >
                    {promoApplied ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;