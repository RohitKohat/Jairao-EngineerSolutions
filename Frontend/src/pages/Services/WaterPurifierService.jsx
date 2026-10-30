import { useState } from 'react';
import { assets } from '../../assets/assets';
import image from '../../assets/images/water purifier.jpg';
import ServiceBookingForm from './ServiceBookingForm';
import './WaterPurifierService.css';

const WaterPurifierService = () => {
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
    closePopup(); // Close the popup if open
    window.scrollTo(0, 0); // Scroll to top to show the form
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const waterpurifierrepair = [
    { title: 'Water leakage', rating: 3.9, price: 399 },
    { title: 'Low water flow', rating: 3.9, price: 399 },
    { title: 'Foul taste/odour', rating: 3.9, price: 399 },
    { title: 'Unknown Issue', rating: 3.9, price: 399 },
    { title: 'Not working', rating: 3.9, price: 399 },
  ];

  const waterpurifierservice = [
    { title: 'Water purifier service', rating: 3.9, price: 599 },
  ];

  const waterpurifierinstall = [
    { title: 'Water purifier installation', rating: 3.9, price: 449 },
  ];

  const waterpurifieruninstall = [
    { title: 'Water purifier uninstallation', rating: 3.9, price: 299 },
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
        serviceType="WATER_PURIFIER_REPAIR"
        serviceTitle={selectedService.title}
        serviceDescription={`Starting at ₹${selectedService.price} - Professional water purifier repair and maintenance`}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  // OTHERWISE, SHOW THE MAIN WATER PURIFIER MARKETING PAGE
  // ═══════════════════════════════════════════════════════
  return (
    <div className="wp-page">
      <div className="wp-container">
        
        {/* ── LEFT PANEL ── */}
        <aside className="wp-left">
          <h1>Water Purifier Services &amp; Repair</h1>
          <div className="wp-warranty">
            ✅ Up to 90-day warranty on all repairs
          </div>

          <div className="wp-services-nav">
            <div
              className="wp-service-nav-item"
              onClick={() => scrollToSection('repair')}
            >
              <img alt="Repair" src={assets.waterpurifierrepair} />
              <p>Repair</p>
            </div>
            <div
              className="wp-service-nav-item"
              onClick={() => scrollToSection('service')}
            >
              <img alt="Service" src={assets.waterpurifierservice} />
              <p>Service</p>
            </div>
            <div
              className="wp-service-nav-item"
              onClick={() => scrollToSection('installation')}
            >
              <img alt="Install" src={assets.waterpurifierinstall} />
              <p>Install / Uninstall</p>
            </div>
          </div>

          <div className="wp-promo-image">
            <img src={image} alt="Water Purifier Service Promo" />
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="wp-right">
          
          {/* Repair */}
          <h2 className="wp-section-heading" id="repair">
            Repair
          </h2>

          <div className="wp-service-row">
            <img
              alt="Water purifier repair"
              src={assets.purifierrepair}
              className="wp-service-img"
            />
            <div className="wp-service-info">
              <div className="wp-service-name">
                Water purifier check-up
              </div>
              <div className="wp-service-starts">Starts at ₹299</div>
              <div className="wp-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="wp-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Check-up',
                      waterpurifierrepair
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wp-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Check-up',
                      waterpurifierrepair
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Service */}
          <h2 className="wp-section-heading" id="service">
            Service
          </h2>

          <div className="wp-service-row">
            <img
              alt="Water purifier service"
              src={assets.waterpurifiers}
              className="wp-service-img"
            />
            <div className="wp-service-info">
              <div className="wp-service-name">
                Water purifier filter check-up
              </div>
              <div className="wp-service-starts">Starts at ₹399</div>
              <div className="wp-service-desc">
                Filter &amp; membrane check-up followed by filter replacement
                if required.
              </div>
              <span
                className="wp-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Filter Check-up',
                      waterpurifierservice
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wp-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Filter Check-up',
                      waterpurifierservice
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Installation / Uninstallation */}
          <h2 className="wp-section-heading" id="installation">
            Installation / Uninstallation
          </h2>

          <div className="wp-service-row">
            <img
              alt="Install"
              src={assets.waterpurifierinstall}
              className="wp-service-img"
            />
            <div className="wp-service-info">
              <div className="wp-service-name">
                Water Purifier Installation
              </div>
              <div className="wp-service-starts">Starts at ₹449</div>
              <span
                className="wp-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Installation',
                      waterpurifierinstall
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wp-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Installation',
                      waterpurifierinstall
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          <div className="wp-service-row">
            <img
              alt="Uninstall"
              src={assets.waterpurifierinstall}
              className="wp-service-img"
            />
            <div className="wp-service-info">
              <div className="wp-service-name">
                Water Purifier Uninstallation
              </div>
              <div className="wp-service-starts">Starts at ₹299</div>
              <span
                className="wp-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Uninstallation',
                      waterpurifieruninstall
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wp-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Water Purifier Uninstallation',
                      waterpurifieruninstall
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
        <div className="wp-popup" onClick={closePopup}>
          <div className="wp-popup-content" onClick={(e) => e.stopPropagation()}>
            {popupContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterPurifierService;