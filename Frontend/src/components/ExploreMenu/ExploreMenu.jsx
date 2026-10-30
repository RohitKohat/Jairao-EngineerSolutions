import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ExploreMenu.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/style.css';

import truckIcon from '../../assets/images/truck.svg';
import bagIcon from '../../assets/images/bag.svg';
import supportIcon from '../../assets/images/support.svg';
import returnIcon from '../../assets/images/return.svg';
import whyChooseImg from '../../assets/images/salies.jpg';
import solarservice from "../../assets/images/solarservice.jpg";
import imgGrid1 from '../../assets/87df2777-e7e7-4b47-9b44-2c99ef3d3d15.png';
// ✅ Keeping these two local imports (make sure the exact filenames match)
import imgGrid2 from "../../assets/images/salesandservie.png";
import imgGrid3 from "../../assets/images/15141a80-6563-4774-985d-b2b5528ec718.png";

const ExploreMenu = () => {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('em-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.em-animate').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="explore-menu-wrapper">

      {/* ============ WHY CHOOSE US ============ */}
      <section className="why-choose-section">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6 em-animate em-fade-left">
              <h2 className="section-title">Why Choose Us</h2>
              <p>
                Choose us for quality products, fast shipping, secure payments, 24/7 support,
                hassle-free returns, and an exceptional shopping experience.
              </p>
              <div className="row my-5 g-3">
                <div className="col-6 col-md-6">
                  <div className="feature em-card em-animate em-fade-up" style={{ '--em-delay': '0ms' }}>
                    <div className="icon em-icon">
                      <img src={truckIcon} alt="Fast & Free Shipping" className="img-fluid" />
                    </div>
                    <h3>Fast &amp; Free Shipping</h3>
                    <p>Enjoy Fast &amp; Free Shipping on all orders! Shop now for quick and hassle-free delivery.</p>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="feature em-card em-animate em-fade-up" style={{ '--em-delay': '80ms' }}>
                    <div className="icon em-icon">
                      <img src={bagIcon} alt="Easy to Shop" className="img-fluid" />
                    </div>
                    <h3>Easy to Shop</h3>
                    <p>Enjoy a seamless, hassle-free experience with fast checkout and secure payments.</p>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="feature em-card em-animate em-fade-up" style={{ '--em-delay': '160ms' }}>
                    <div className="icon em-icon">
                      <img src={supportIcon} alt="24/7 Support" className="img-fluid" />
                    </div>
                    <h3>24/7 Support</h3>
                    <p>Get 24/7 support! Our team is always available to assist you anytime, anywhere.</p>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="feature em-card em-animate em-fade-up" style={{ '--em-delay': '240ms' }}>
                    <div className="icon em-icon">
                      <img src={returnIcon} alt="Hassle Free Returns" className="img-fluid" />
                    </div>
                    <h3>Hassle Free Returns</h3>
                    <p>Enjoy hassle-free returns! Shop with confidence knowing you can return items easily and quickly.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 em-animate em-fade-right">
              <div className="img-wrap em-img-wrap">
                <img src={whyChooseImg} alt="Why Choose Us" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WE HELP YOU SECTION ============ */}
      <section className="we-help-section">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-7 mb-5 mb-lg-0 em-animate em-fade-left">
              <div className="imgs-grid">
                
                {/* 1st Image: ONLINE Image + MEGA SALE Overlay (Fixes the error) */}
                 <div 
                  className="grid grid-1 em-grid-img" 
                  style={{ 
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: `url(${imgGrid1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                 
                  
                  
                  {/* Text */}
                  <div style={{
                    position: 'relative', zIndex: 2,
                    textAlign: 'center', padding: '20px'
                  }}>
                    
                    
                  </div>
                </div>

                {/* 2nd Image: Local Asset */}
                <div className="grid grid-2 em-grid-img">
                  <img src={imgGrid2} alt="Sales and Service" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* 3rd Image: Local Asset */}
                <div className="grid grid-3 em-grid-img">
                  <img src={imgGrid3} alt="Modern Home" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

              </div>
            </div>
            <div className="col-lg-5 ps-lg-5 em-animate em-fade-right">
              <h2 className="section-title mb-4">
                We Help You Make Modern Home Appliances Sales and Services
              </h2>
              <p>
                We help you create a modern home with high-quality appliances that enhance your
                daily life. Our products are designed for efficiency, style, and convenience.
              </p>
              <ul className="list-unstyled custom-list my-4">
                <li>High-Quality Appliances</li>
                <li>Sales Experience</li>
                <li>Reliable Services</li>
                <li>Customer Satisfaction</li>
              </ul>
              <Link to="/shop" className="btn btn-primary">Explore Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOLAR SERVICES ============ */}
      <section className="why-choose-section">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6 em-animate em-fade-left">
              <h2 className="section-title">Solar Services</h2>
              <p>
                Reliable and efficient solar services for installation, maintenance, and repair.
                Harness the power of the sun with expert solutions. Go green and save energy today.
              </p>
              <div className="row my-5 g-3">
                <div className="col-6 col-md-6">
                  <div className="feature em-solar-card em-animate em-fade-up" style={{ '--em-delay': '0ms' }}>
                    <h4>On-Grid Solar System</h4>
                    <p>Efficient on-grid solar systems for seamless energy savings and reduced electricity bills.</p>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="feature em-solar-card em-animate em-fade-up" style={{ '--em-delay': '80ms' }}>
                    <h4>Off-Grid Solar System</h4>
                    <p>Reliable off-grid solar systems for uninterrupted power in remote locations.</p>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="feature em-solar-card em-animate em-fade-up" style={{ '--em-delay': '160ms' }}>
                    <h4>Hybrid Solar System</h4>
                    <p>Hybrid solar systems combine the best of on-grid and off-grid solutions for continuous power.</p>
                  </div>
                </div>
              </div>
              <Link to="/solar" className="btn btn-primary">Get Now</Link>
            </div>
            <div className="col-lg-5 em-animate em-fade-right">
              <div className="img-wrap em-img-wrap">
                <img src={solarservice} alt="Solar Services" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ExploreMenu;