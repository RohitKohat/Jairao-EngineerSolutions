import { useState } from 'react';
import { assets } from '../../assets/assets';
import image from '../../assets/images/refrigerator service.jpg';
import ServiceBookingForm from './ServiceBookingForm';
import './RefrigeratorService.css';

const RefrigeratorService = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  
  // State to track which service the user selected for booking
  const [selectedService, setSelectedService] = useState(null);

  const openPopup = (content) => {
    setPopupContent(content);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupContent('');
  };

  // Triggered when a user clicks "Add" on a specific service in the popup
  const handleAddClick = (service) => {
    setSelectedService(service);
    closePopup(); // Close the popup
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const refrigeratorservice = [
    { title: 'Excess cooling (frost formation)', rating: 3.9, price: 199 },
    { title: 'No cooling', rating: 3.9, price: 199 },
    { title: 'No power', rating: 3.9, price: 199 },
    { title: 'Noise issue', rating: 3.9, price: 199 },
    { title: 'Door issue', rating: 3.9, price: 199 },
    { title: 'Water leakage', rating: 3.9, price: 499 },
    { title: 'Gas Charging', rating: 3.9, price: 999 },
  ];

  const buildPopupCards = (title, items) => (
    <div className="popup-inner">
      <div className="popup-header">
        <h2 className="popup-title">{title}</h2>
        <button className="close-button" onClick={closePopup} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="popup-body">
        <div className="sc-container">
          {items.map((service, index) => (
            <div className="sc-card" key={index}>
              <div className="sc-title">{service.title}</div>
              <div className="sc-rating">
                <span className="star-pill">★ {service.rating}</span>
              </div>
              <div className="sc-price">₹{service.price}</div>
              <button
                className="sc-add-btn"
                onClick={() => handleAddClick(service)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // IF A SERVICE IS SELECTED, SHOW THE BOOKING FORM
  // ═══════════════════════════════════════════════════════
  if (selectedService) {
    return (
      <ServiceBookingForm
        serviceType="REFRIGERATOR_REPAIR"
        serviceTitle={selectedService.title}
        serviceDescription={`Starting at ₹${selectedService.price} - Expert refrigerator repair and maintenance`}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  // OTHERWISE, SHOW THE MAIN REFRIGERATOR MARKETING PAGE
  // ═══════════════════════════════════════════════════════
  return (
    <div className="rf-page">
      <div className="rf-container">
        
        {/* ── LEFT PANEL ── */}
        <aside className="rf-left">
          <h1>Refrigerator Services &amp; Repair</h1>
          <div className="rf-warranty">
            ✅ Up to 90-day warranty on all repairs
          </div>

          <div className="rf-services-nav">
            <div
              className="rf-service-nav-item"
              onClick={() => scrollToSection('single-door')}
            >
              <img alt="Single door" src={assets.singledoorref} />
              <p>Single Door</p>
            </div>
            <div
              className="rf-service-nav-item"
              onClick={() => scrollToSection('double-door')}
            >
              <img alt="Double door" src={assets.doubledoorref} />
              <p>Double Door</p>
            </div>
            <div
              className="rf-service-nav-item"
              onClick={() => scrollToSection('side-door')}
            >
              <img alt="Side by side" src={assets.sideref} />
              <p>Side-by-Side</p>
            </div>
          </div>

          <div className="rf-promo-image">
            <img src={image} alt="Refrigerator Service Promo" />
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="rf-right">
          
          {/* Single Door */}
          <h2 className="rf-section-heading" id="single-door">
            Single Door
          </h2>

          <div className="rf-service-row">
            <img
              alt="Single door"
              src={assets.singledoorref}
              className="rf-service-img"
            />
            <div className="rf-service-info">
              <div className="rf-service-name">
                Single door refrigerator check-up
              </div>
              <div className="rf-service-starts">Starts at ₹299</div>
              <div className="rf-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="rf-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Single Door Refrigerator Check-up',
                      refrigeratorservice
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="rf-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Single Door Refrigerator Check-up',
                      refrigeratorservice
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Double Door */}
          <h2 className="rf-section-heading" id="double-door">
            Double Door
          </h2>

          <div className="rf-service-row">
            <img
              alt="Double door"
              src={assets.doubledoorref}
              className="rf-service-img"
            />
            <div className="rf-service-info">
              <div className="rf-service-name">
                Double door refrigerator check-up (inverter)
              </div>
              <div className="rf-service-starts">Starts at ₹299</div>
              <div className="rf-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="rf-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Double Door Refrigerator Check-up (Inverter)',
                      refrigeratorservice
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="rf-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Double Door Refrigerator Check-up (Inverter)',
                      refrigeratorservice
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          <div className="rf-service-row">
            <img
              alt="Double door"
              src={assets.doubledoorref}
              className="rf-service-img"
            />
            <div className="rf-service-info">
              <div className="rf-service-name">
                Double door refrigerator check-up (non-inverter)
              </div>
              <div className="rf-service-starts">Starts at ₹299</div>
              <div className="rf-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="rf-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Double Door Refrigerator Check-up (Non-Inverter)',
                      refrigeratorservice
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="rf-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Double Door Refrigerator Check-up (Non-Inverter)',
                      refrigeratorservice
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Side-by-Side Door */}
          <h2 className="rf-section-heading" id="side-door">
            Side-by-Side Door
          </h2>

          <div className="rf-service-row">
            <img
              alt="Side by side"
              src={assets.sideref}
              className="rf-service-img"
            />
            <div className="rf-service-info">
              <div className="rf-service-name">
                Side-by-side door refrigerator check-up
              </div>
              <div className="rf-service-starts">Starts at ₹299</div>
              <div className="rf-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="rf-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Side-by-Side Door Refrigerator Check-up',
                      refrigeratorservice
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="rf-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Side-by-Side Door Refrigerator Check-up',
                      refrigeratorservice
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

        </main>
      </div>

      {/* ── POPUP ── */}
      {isPopupOpen && (
        <div className="rf-popup" onClick={closePopup}>
          <div className="rf-popup-content" onClick={(e) => e.stopPropagation()}>
            {popupContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefrigeratorService;