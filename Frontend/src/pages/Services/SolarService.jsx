import { useContext, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import SolarProposal from '../../components/SolarProposal/SolarProposal';
import './SolarService.css';

// ─── All plans with panelQty, subsidy, price ─────────────────────────────
const singlePhasePlans = [
  { id: 1, name: '1KW', panelQty: 2, subsidy: '30,000', price: 70000 },
  { id: 2, name: '2KW', panelQty: 4, subsidy: '60,000', price: 125000 },
  { id: 3, name: '3KW', panelQty: 6, subsidy: '78,000', price: 195000 },
  { id: 4, name: '4KW', panelQty: 8, subsidy: '78,000', price: 240000 },
  { id: 5, name: '5KW', panelQty: 9, subsidy: '78,000', price: 300000 },
  { id: 6, name: '6KW', panelQty: 11, subsidy: '78,000', price: 340000 },
];

const threePhasePlans = [
  { id: 7, name: '5KW', panelQty: 9, subsidy: '78,000', price: 325000 },
  { id: 8, name: '6KW', panelQty: 11, subsidy: '78,000', price: 380000 },
  { id: 9, name: '7KW', panelQty: 13, subsidy: '78,000', price: 400000 },
  { id: 10, name: '8KW', panelQty: 14, subsidy: '78,000', price: 435000 },
  { id: 11, name: '9KW', panelQty: 16, subsidy: '78,000', price: 500000 },
  { id: 12, name: '10KW', panelQty: 18, subsidy: '78,000', price: 540000 },
];

const formatPrice = (n) => new Intl.NumberFormat('en-IN').format(n);

const SolarService = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState(null); // 'details' | 'cart'
  const [activePlan, setActivePlan] = useState(null);

  const { token } = useContext(StoreContext);
  let decodedToken = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const openDetails = (plan) => {
    setActivePlan(plan);
    setPopupType('details');
    setIsPopupOpen(true);
  };

  const openCart = (plan) => {
    setActivePlan(plan);
    setPopupType('cart');
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setActivePlan(null);
    setPopupType(null);
  };

  const addServiceToBackend = async (service) => {
    if (!decodedToken) {
      alert('You need to be logged in to add a service.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/services', {
        title: service.title,
        price: service.price,
        rating: service.rating,
        category: 'installation',
        userId: decodedToken.id,
      });
      alert(`Service "${service.title}" added successfully!`);
      console.log(response.data);
    } catch (error) {
      console.error('Error adding service:', error);
      alert(
        `Failed to add service. Error: ${
          error.response ? error.response.data.message : error.message
        }`
      );
    }
  };

  const getCartOptions = (plan) => [
    {
      title: plan.name,
      rating: 4.0,
      price: plan.price,
    },
    {
      title: `${plan.name} Commercial`,
      rating: 4.0,
      price: Math.round(plan.price * 0.72),
    },
  ];

  const renderPlanRow = (plan) => (
    <div key={plan.id} className="ss-plan-row">
      <img alt="Solar install" src={assets.solarinstall} />
      <div className="ss-plan-info">
        <div className="ss-plan-name">
          {plan.name} — ₹{formatPrice(plan.price)}
        </div>
        <div className="ss-plan-subsidy">
          Subsidy {plan.name} - ₹ {plan.subsidy}/-
        </div>
      </div>
      <div className="ss-plan-actions">
        <button
          className="ss-btn ss-btn-outline"
          onClick={() => openDetails(plan)}
        >
          View Details
        </button>
        <button
          className="ss-btn ss-btn-primary"
          onClick={() => openCart(plan)}
        >
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="ss-page">
      <div className="ss-container">
        {/* ═══ LEFT PANEL ═══ */}
        <aside className="ss-left">
          <h1>Solar Services</h1>
          <div className="ss-warranty">Up to 180-day warranty on all repairs</div>

          <div className="ss-nav">
            <div className="ss-nav-item">
              <img alt="Sales" src={assets.solarsales} />
              <p>Sales</p>
            </div>
            <div className="ss-nav-item">
              <img alt="Service" src={assets.solaeservices} />
              <p>Service</p>
            </div>
            <div className="ss-nav-item">
              <img alt="Install" src={assets.solarinstall} />
              <p>Installation</p>
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT PANEL ═══ */}
        <main className="ss-right">
          <h2 className="ss-section-heading">Solar Installation — Single Phase</h2>
          {singlePhasePlans.map(renderPlanRow)}

          <h2 className="ss-section-heading">Solar Installation — Three Phase</h2>
          {threePhasePlans.map(renderPlanRow)}

          <h2 className="ss-section-heading">Solar Services</h2>
          <div className="ss-plan-row">
            <img alt="Solar service" src={assets.solaeservices} />
            <div className="ss-plan-info">
              <div className="ss-plan-name">Solar Service</div>
              <div className="ss-plan-subsidy">Starts at ₹499</div>
            </div>
            <div className="ss-plan-actions">
              <button
                className="ss-btn ss-btn-outline"
                onClick={() =>
                  openDetails({
                    name: 'Solar Service',
                    subsidy: '—',
                    panelQty: 2,
                    price: 499,
                  })
                }
              >
                View Details
              </button>
              <button
                className="ss-btn ss-btn-primary"
                onClick={() =>
                  openCart({
                    name: 'Solar Service',
                    price: 499,
                  })
                }
              >
                Add
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ═══ POPUP ═══ */}
      {isPopupOpen && activePlan && (
        <div className="ss-popup" onClick={closePopup}>
          <div
            className="ss-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ss-popup-close"
              onClick={closePopup}
              aria-label="Close"
            >
              ✕
            </button>

            {popupType === 'details' && (
              <SolarProposal
                capacity={activePlan.name}
                subsidy={activePlan.subsidy}
                panelQty={activePlan.panelQty}
              />
            )}

            {popupType === 'cart' && (
              <div className="ss-cart-popup">
                <h2>Add to Cart — {activePlan.name}</h2>
                <div className="ss-cart-grid">
                  {getCartOptions(activePlan).map((service, i) => (
                    <div key={i} className="ss-cart-card">
                      <div className="ss-cart-title">{service.title}</div>
                      <div className="ss-cart-rating">★ {service.rating}</div>
                      <div className="ss-cart-price">
                        ₹{formatPrice(service.price)}
                      </div>
                      <button
                        className="ss-cart-add"
                        onClick={() => addServiceToBackend(service)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarService;