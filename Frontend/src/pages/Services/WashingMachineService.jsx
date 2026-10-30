import { useState } from 'react';
import { assets } from '../../assets/assets';
import image from '../../assets/images/washing-machine-repair-services.jpg';
import ServiceBookingForm from './ServiceBookingForm';
import './WashingMachine.css';

const WashingMachine = () => {
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

  const washingmachineauto = [
    { title: 'Noise issue', rating: 3.9, price: 499 },
    { title: 'Power Issue', rating: 3.9, price: 499 },
    { title: 'Draining issue', rating: 3.9, price: 499 },
    { title: 'Error in display', rating: 3.9, price: 499 },
    { title: 'Not spinning', rating: 3.9, price: 499 },
    { title: 'Unknown issue', rating: 3.9, price: 499 },
  ];

  const washingmachineinstall = [
    { title: 'Fully automatic top load', rating: 3.9, price: 499 },
    { title: 'Fully automatic front load', rating: 3.9, price: 499 },
    { title: 'Semi-automatic', rating: 3.9, price: 499 },
  ];

  const washingmachineuninstall = [
    { title: 'Fully automatic top load', rating: 3.9, price: 399 },
    { title: 'Fully automatic front load', rating: 3.9, price: 399 },
    { title: 'Semi-automatic', rating: 3.9, price: 399 },
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
        serviceType="WASHING_MACHINE_REPAIR"
        serviceTitle={selectedService.title}
        serviceDescription={`Starting at ₹${selectedService.price} - Professional washing machine repair and maintenance`}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  // OTHERWISE, SHOW THE MAIN WASHING MACHINE MARKETING PAGE
  // ═══════════════════════════════════════════════════════
  return (
    <div className="wm-page">
      <div className="wm-container">
        
        {/* ── LEFT PANEL ── */}
        <aside className="wm-left">
          <h1>Washing Machine Services &amp; Repair</h1>
          <div className="wm-warranty">
            ✅ Up to 90-day warranty on all repairs
          </div>

          <div className="wm-services-nav">
            <div
              className="wm-service-nav-item"
              onClick={() => scrollToSection('repair')}
            >
              <img alt="Repair" src={assets.washingrepair} />
              <p>Repair</p>
            </div>
            <div
              className="wm-service-nav-item"
              onClick={() => scrollToSection('service')}
            >
              <img alt="Service" src={assets.washingservice} />
              <p>Service</p>
            </div>
            <div
              className="wm-service-nav-item"
              onClick={() => scrollToSection('install')}
            >
              <img alt="Install" src={assets.washingmachine} />
              <p>Install / Uninstall</p>
            </div>
          </div>

          <div className="wm-promo-image">
            <img src={image} alt="Washing Machine Service Promo" />
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="wm-right">
          
          {/* Repair */}
          <h2 className="wm-section-heading" id="repair">
            Repair
          </h2>

          <div className="wm-service-row">
            <img
              alt="Washing machine"
              src={assets.washinginstall}
              className="wm-service-img"
            />
            <div className="wm-service-info">
              <div className="wm-service-name">
                Fully automatic washing machine check-up (top load)
              </div>
              <div className="wm-service-starts">Starts at ₹199</div>
              <div className="wm-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="wm-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Fully Automatic Washing Machine Check-up (Top Load)',
                      washingmachineauto
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wm-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Fully Automatic Washing Machine Check-up (Top Load)',
                      washingmachineauto
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          <div className="wm-service-row">
            <img
              alt="Washing machine"
              src={assets.washinginstall}
              className="wm-service-img"
            />
            <div className="wm-service-info">
              <div className="wm-service-name">
                Fully automatic washing machine check-up (front load)
              </div>
              <div className="wm-service-starts">Starts at ₹199</div>
              <div className="wm-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="wm-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Fully Automatic Washing Machine Check-up (Front Load)',
                      washingmachineauto
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wm-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Fully Automatic Washing Machine Check-up (Front Load)',
                      washingmachineauto
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          <div className="wm-service-row">
            <img
              alt="Washing machine"
              src={assets.washingmachines}
              className="wm-service-img"
            />
            <div className="wm-service-info">
              <div className="wm-service-name">
                Semi-automatic washing machine check-up
              </div>
              <div className="wm-service-starts">Starts at ₹199</div>
              <div className="wm-service-desc">
                Complete check-up to identify issues before repair.
              </div>
              <span
                className="wm-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Semi-Automatic Washing Machine Check-up',
                      washingmachineauto
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wm-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Semi-Automatic Washing Machine Check-up',
                      washingmachineauto
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Installation */}
          <h2 className="wm-section-heading" id="install">
            Installation
          </h2>

          <div className="wm-service-row">
            <img
              alt="Install"
              src={assets.washinginstall}
              className="wm-service-img"
            />
            <div className="wm-service-info">
              <div className="wm-service-name">
                Washing Machine Installation
              </div>
              <div className="wm-service-starts">Starts at ₹349</div>
              <span
                className="wm-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Washing Machine Installation',
                      washingmachineinstall
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wm-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Washing Machine Installation',
                      washingmachineinstall
                    )
                  )
                }
              >
                Add
              </button>
            </div>
          </div>

          {/* Uninstallation */}
          <h2 className="wm-section-heading">Uninstallation</h2>

          <div className="wm-service-row">
            <img
              alt="Washing machine"
              src={assets.washinginstall}
              className="wm-service-img"
            />
            <div className="wm-service-info">
              <div className="wm-service-name">
                Washing Machine Uninstallation
              </div>
              <div className="wm-service-starts">Starts at ₹349</div>
              <span
                className="wm-details-link"
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Washing Machine Uninstallation',
                      washingmachineuninstall
                    )
                  )
                }
              >
                View details
              </span>
            </div>
            <div className="wm-add-button">
              <button
                onClick={() =>
                  openPopup(
                    buildPopupCards(
                      'Washing Machine Uninstallation',
                      washingmachineuninstall
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
        <div className="wm-popup" onClick={closePopup}>
          <div className="wm-popup-content" onClick={(e) => e.stopPropagation()}>
            {popupContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default WashingMachine;