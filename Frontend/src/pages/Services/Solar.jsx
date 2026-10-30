import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SolarProposal from '../../components/SolarProposal/SolarProposal';
import './Solar.css';

import heroImage1 from '../../assets/images/1200-675-20908254-thumbnail-16x9-pm-surya-ghar-scheme (1) (1).png';
import heroImage2 from '../../assets/images/On-Grid-Solar-Power-System (1).png';
import heroImage3 from '../../assets/images/Off-Grid-Solar-1.png';
import heroImage4 from '../../assets/images/hybrid-solar-panel-system-2.png';
import product1 from '../../assets/images/Untitled design (44).png';

// ─── Hero slides ─────────────────────────────────────────────────────────────
const heroSlides = [
  {
    image: heroImage1,
    title: 'Solar Services',
    desc: 'Expert solar panel installation, maintenance, and repair services for efficient energy solutions.',
  },
  {
    image: heroImage2,
    title: 'On-Grid Solar System',
    desc: 'Connect to the grid and reduce your electricity bills with net metering.',
  },
  {
    image: heroImage3,
    title: 'Off-Grid Solar System',
    desc: 'Complete energy independence with battery storage for remote locations.',
  },
  {
    image: heroImage4,
    title: 'Hybrid Solar System',
    desc: 'Best of both worlds — grid connection plus battery backup for uninterrupted power.',
  },
];

// ─── All 12 plans with panelQty ─────────────────────────────────────────────
const singlePhasePlans = [
  { id: 1, name: '1KW', panelQty: 2, subsidy: '30,000' },
  { id: 2, name: '2KW', panelQty: 4, subsidy: '60,000' },
  { id: 3, name: '3KW', panelQty: 6, subsidy: '78,000' },
  { id: 4, name: '4KW', panelQty: 8, subsidy: '78,000' },
  { id: 5, name: '5KW', panelQty: 9, subsidy: '78,000' },
  { id: 6, name: '6KW', panelQty: 11, subsidy: '78,000' },
];

const threePhasePlans = [
  { id: 7, name: '5KW', panelQty: 9, subsidy: '78,000' },
  { id: 8, name: '6KW', panelQty: 11, subsidy: '78,000' },
  { id: 9, name: '7KW', panelQty: 13, subsidy: '78,000' },
  { id: 10, name: '8KW', panelQty: 14, subsidy: '78,000' },
  { id: 11, name: '9KW', panelQty: 16, subsidy: '78,000' },
  { id: 12, name: '10KW', panelQty: 18, subsidy: '78,000' },
];

const Solar = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPlan, setPopupPlan] = useState(null);
  const intervalRef = useRef(null);

  // Hero carousel auto-play
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Lock body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = isPopupOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  const openPopup = (plan) => {
    setPopupPlan(plan);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupPlan(null);
  };

  const handleGetQuoteClick = (plan) => {
    navigate('/solarform', { state: { capacity: plan.name, subsidy: plan.subsidy } });
  };

  const renderPlanCard = (plan) => (
    <div key={plan.id} className="solar-plan-card">
      <div className="solar-plan-img-wrap">
        <img src={product1} alt={plan.name} />
      </div>
      <h3 className="solar-plan-name">{plan.name}</h3>
      <p className="solar-plan-subsidy">Subsidy: ₹ {plan.subsidy}/-</p>
      <div className="solar-plan-actions">
        <button
          className="solar-btn solar-btn-primary"
          onClick={() => openPopup(plan)}
        >
          View Details
        </button>
        <button
          className="solar-btn solar-btn-secondary"
          onClick={() => handleGetQuoteClick(plan)}
        >
          Get Quote
        </button>
      </div>
    </div>
  );

  return (
    <div className="solar-page">
      {/* ============================
          HERO CAROUSEL
         ============================ */}
      <div
        className="solar-hero"
        onMouseEnter={() => clearInterval(intervalRef.current)}
        onMouseLeave={() => {
          intervalRef.current = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
          }, 4000);
        }}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`solar-hero-slide ${
              index === activeSlide ? 'solar-hero-slide--active' : ''
            }`}
          >
            <div className="solar-hero-content">
              <div className="solar-hero-text">
                {/* Clean layout without the floating badge */}
                <h1>{slide.title}</h1>
                <p>{slide.desc}</p>
                <Link to="/solarform" className="solar-hero-btn">
                  Get a Quote →
                </Link>
              </div>
              <div className="solar-hero-image">
                <img src={slide.image} alt={slide.title} />
              </div>
            </div>
          </div>
        ))}

        <div className="solar-hero-counter">
          {String(activeSlide + 1).padStart(2, '0')} /{' '}
          {String(heroSlides.length).padStart(2, '0')}
        </div>

        <div className="solar-hero-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`solar-hero-dot ${
                i === activeSlide ? 'solar-hero-dot--active' : ''
              }`}
              onClick={() => setActiveSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ============================
          SINGLE PHASE PLANS
         ============================ */}
      <section className="solar-plans-section">
        <div className="solar-container">
          <div className="solar-section-header">
            <span className="solar-section-eyebrow">Single Phase</span>
            <h2>Residential Solar Plans</h2>
            <p>Perfect for homes with a single-phase connection.</p>
          </div>
          <div className="solar-plans-grid">
            {singlePhasePlans.map(renderPlanCard)}
          </div>
        </div>
      </section>

      {/* ============================
          THREE PHASE PLANS
         ============================ */}
      <section className="solar-plans-section solar-plans-section--alt">
        <div className="solar-container">
          <div className="solar-section-header">
            <span className="solar-section-eyebrow">Three Phase</span>
            <h2>Commercial Solar Plans</h2>
            <p>Higher capacity for commercial and industrial use.</p>
          </div>
          <div className="solar-plans-grid">
            {threePhasePlans.map(renderPlanCard)}
          </div>
        </div>
      </section>

      {/* ============================
          POPUP WITH PROPOSAL
         ============================ */}
      {isPopupOpen && popupPlan && (
        <div className="solar-popup" onClick={closePopup}>
          <div
            className="solar-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="solar-popup-close"
              onClick={closePopup}
              aria-label="Close"
            >
              ✕
            </button>
            <SolarProposal
              capacity={popupPlan.name}
              subsidy={popupPlan.subsidy}
              panelQty={popupPlan.panelQty}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Solar;