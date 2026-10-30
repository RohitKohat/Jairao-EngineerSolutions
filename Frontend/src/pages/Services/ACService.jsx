import { useState } from 'react';
import { assets } from '../../assets/assets';
import image from '../../assets/images/acsale.jpg';
import ServiceBookingForm from './ServiceBookingForm';
import './ACService.css';

const ACService = () => {
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

  // Triggered when a user clicks "Add" on a specific service
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

  const acrepair = [
    { title: 'Less/no cooling', rating: 3.8, price: 499 },
    { title: 'Power issue', rating: 3.8, price: 499 },
    { title: 'Unwanted noise/smell', rating: 3.8, price: 499 },
    { title: 'Water leakage', rating: 3.8, price: 499 },
  ];

  const acgas = [
    { title: 'AC gas leak fix & refill', rating: 3.8, price: 3000 },
    { title: 'AC gas top-up', rating: 3.8, price: 1500 },
  ];

  const acservice = [
    { title: 'Split AC', rating: 3.8, price: 227 },
    { title: 'Window AC', rating: 3.8, price: 227 },
  ];

  const acservices = [
    { title: 'Anti-rust deep clean AC service', rating: 3.8, price: 227 },
  ];

  const acinstall = [
    { title: 'Split AC', rating: 3.8, price: 699 },
    { title: 'Window AC', rating: 3.8, price: 599 },
  ];

  const acuninstall = [
    { title: 'Split AC', rating: 3.8, price: 599 },
    { title: 'Window AC', rating: 3.8, price: 499 },
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
        serviceType="AC_REPAIR"
        serviceTitle={selectedService.title}
        serviceDescription={`Starting at ₹${selectedService.price} - Expert AC repair and maintenance`}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  // OTHERWISE, SHOW THE MAIN AC SERVICES MARKETING PAGE
  // ═══════════════════════════════════════════════════════
  return (
    <div className="ac-page">
      <div className="ac-container">
        
        {/* ── LEFT PANEL ── */}
        <aside className="ac-left">
          <h1>AC Services &amp; Repair</h1>
          <div className="ac-warranty">
            ✅ Up to 90-day warranty on all repairs
          </div>

          <div className="ac-services-nav">
            <div
              className="ac-service-nav-item"
              onClick={() => scrollToSection('ac-repair')}
            >
              <img alt="Repair" src={assets.acrepair} />
              <p>Repair</p>
            </div>
            <div
              className="ac-service-nav-item"
              onClick={() => scrollToSection('ac-service')}
            >
              <img alt="Service" src={assets.acservice} />
              <p>Service</p>
            </div>
            <div
              className="ac-service-nav-item"
              onClick={() => scrollToSection('ac-install')}
            >
              <img alt="Install" src={assets.acintallation} />
              <p>Install / Uninstall</p>
            </div>
          </div>

          <div className="ac-promo-image">
            <img src={image} alt="AC Service Promo" />
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="ac-right">
          
          <h2 className="ac-section-heading">Repair &amp; Gas Refill</h2>

          {/* AC Repair */}
          <div className="ac-service-row" id="ac-repair">
            <img
              alt="AC Repair"
              src={assets.acimage}
              className="ac-service-img"
            />
            <div className="ac-service-info">
              <div className="ac-service-name">AC Repair</div>
              <div className="ac-service-starts">Starts at ₹299</div>
              <div className="ac-service-desc">
                Detailed examination to find problems before fixing them.
              </div>
              <span
                className="ac-details-link"
                onClick={() =>
                  openPopup(buildPopupCards('AC Repair', acrepair))
                }
              >
                View details
              </span>
            </div>
            <div className="ac-add-button">
              <button
                onClick={() =>
                  openPopup(buildPopupCards('AC Repair', acrepair))
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* AC Gas */}
          <div className="ac-service-row">
            <img
              alt="AC Gas"
              src={assets.gasleakproof}
              className="ac-service-img"
            />
            <div className="ac-service-info">
              <div className="ac-service-name">
                AC gas leak fix &amp; refill
              </div>
              <div className="ac-service-starts">Starts at ₹1999</div>
              <div className="ac-service-desc">
                Before gas is refilled, a thorough inspection is done to find
                and repair any leaks.
              </div>
              <span
                className="ac-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards('AC Gas Leak Fix & Refill', acgas)
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="ac-add-button">
              <button
                onClick={() =>
                  openPopup(buildPopupCards('AC Gas Leak Fix & Refill', acgas))
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Services */}
          <h2 className="ac-section-heading" id="ac-service">
            Services
          </h2>

          <div className="ac-service-row">
            <img
              alt="Foam-jet service"
              src={assets.powerac}
              className="ac-service-img"
            />
            <div className="ac-service-info">
              <div className="ac-service-name">Foam-jet service</div>
              <div className="ac-service-starts">Starts at ₹449</div>
              <div className="ac-service-desc">
                Complete indoor unit cleaning with a foam-jet sprayer.
              </div>
              <div className="ac-service-desc">
                Applicable for both window &amp; split ACs.
              </div>
              <span
                className="ac-details-link"
                onClick={() =>
                  openPopup(buildPopupCards('Foam-Jet Service', acservice))
                }
              >
                View details
              </span>
            </div>
            <div className="ac-add-button">
              <button
                onClick={() =>
                  openPopup(buildPopupCards('Foam-Jet Service', acservice))
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Anti-rust */}
          <div className="ac-service-row">
            <img
              alt="Anti-rust clean"
              src={assets.cleaningac}
              className="ac-service-img"
            />
            <div className="ac-service-info">
              <div className="ac-service-name">
                Anti-rust deep clean AC service
              </div>
              <div className="ac-service-starts">Starts at ₹449</div>
              <div className="ac-service-desc">
                Uses an anti-rust spray to protect and completely clean your
                air conditioner, preventing gas leaks.
              </div>
              <span
                className="ac-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards('Anti-Rust Deep Clean', acservices)
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="ac-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards('Anti-Rust Deep Clean', acservices)
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Installation */}
          <h2 className="ac-section-heading" id="ac-install">
            Installation
          </h2>

          <div className="ac-service-row">
            <img
              alt="AC Installation"
              src={assets.acimage}
              className="ac-service-img"
            />
            <div className="ac-service-info">
              <div className="ac-service-name">AC Installation</div>
              <div className="ac-service-starts">Starts at ₹699</div>
              <span
                className="ac-details-link"
                onClick={() =>
                  openPopup(buildPopupCards('AC Installation', acinstall))
                }
              >
                View details
              </span>
            </div>
            <div className="ac-add-button">
              <button
                onClick={() =>
                  openPopup(buildPopupCards('AC Installation', acinstall))
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Uninstallation */}
          <h2 className="ac-section-heading">Uninstallation</h2>

          <div className="ac-service-row">
            <img
              alt="AC Uninstallation"
              src={assets.acimage}
              className="ac-service-img"
            />
            <div className="ac-service-info">
              <div className="ac-service-name">AC Uninstallation</div>
              <div className="ac-service-starts">Starts at ₹499</div>
              <span
                className="ac-details-link"
                onClick={() =>
                  openPopup(buildPopupCards('AC Uninstallation', acuninstall))
                }
              >
                View details
              </span>
            </div>
            <div className="ac-add-button">
              <button
                onClick={() =>
                  openPopup(buildPopupCards('AC Uninstallation', acuninstall))
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
        <div className="ac-popup" onClick={closePopup}>
          <div className="ac-popup-content" onClick={(e) => e.stopPropagation()}>
            {popupContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default ACService;