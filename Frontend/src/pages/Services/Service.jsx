import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Service.css';

import heroImage1 from '../../assets/images/51xYCxjhGqL._SL1500_ (1)-Photoroom.png';
import heroImage2 from '../../assets/images/21bivbS4ilL (1).png';
import heroImage3 from '../../assets/images/3116W0Ow3iL (1)-Photoroom (1)-Photoroom.png';
import heroImage4 from '../../assets/images/71Kv4RUvrxL._SL1500_ (1)-Photoroom (1)-Photoroom.png';
import product1 from '../../assets/images/41er8MZR58L._SL1500_ (1)-Photoroom.png';
import product2 from '../../assets/images/41eD-lrc-7L._SL1200_-Photoroom (1).png';
import product3 from '../../assets/images/51vNMv6Ua-L._SL1499_ (1).png';
import product4 from '../../assets/images/31cV+Yv71GL._SL1100_ (1) (1).png';

const slides = [
  {
    title: 'AC Service',
    desc: 'Professional AC service and repair for optimal cooling and efficiency.',
    image: heroImage1,
    link: '/services/ac',
  },
  {
    title: 'Refrigerator',
    desc: 'Expert refrigerator repair and maintenance for long-lasting cooling.',
    image: heroImage2,
    link: '/services/refrigerator',
  },
  {
    title: 'Washing Machine',
    desc: 'Reliable washing machine repair and maintenance for smooth operation.',
    image: heroImage3,
    link: '/services/washingMachine',
  },
  {
    title: 'Water Purifier',
    desc: 'Expert water purifier service for clean and safe drinking water.',
    image: heroImage4,
    link: '/services/waterPurifier',
  },
];

const products = [
  { id: 1, name: 'AC Service', image: product1, link: '/services/ac' },
  { id: 2, name: 'Refrigerator Service', image: product2, link: '/services/refrigerator' },
  { id: 3, name: 'Water Purifier', image: product3, link: '/services/waterPurifier' },
  { id: 4, name: 'Washing Machine', image: product4, link: '/services/washingMachine' },
];

const Service = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
  };

  const stopInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, []);

  const goToSlide = (index) => {
    setActiveSlide(index);
    stopInterval();
    startInterval();
  };

  return (
    <div className="service-page">
      
      {/* ============================
          HERO CAROUSEL
         ============================ */}
      <div
        className="sv-carousel"
        onMouseEnter={stopInterval}
        onMouseLeave={startInterval}
      >
        <div className="sv-carousel-counter">
          {String(activeSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>

        {slides.map((slide, index) => (
          <div
            key={index}
            className={`sv-slide ${index === activeSlide ? 'sv-slide--active' : ''}`}
          >
            <div className="sv-slide-content">
              <div className="sv-slide-text">
                {/* Clean layout without the floating badge */}
                <h1 className="sv-title">{slide.title}</h1>
                <p className="sv-desc">{slide.desc}</p>
                <Link to={slide.link} className="sv-cta">
                  Book Now →
                </Link>
              </div>
              <div className="sv-slide-image">
                <img src={slide.image} alt={slide.title} />
              </div>
            </div>
          </div>
        ))}

        {/* Progress dots */}
        <div className="sv-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`sv-dot ${index === activeSlide ? 'sv-dot--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ============================
          PRODUCT SECTION
         ============================ */}
      <section className="sv-products">
        <div className="sv-products-container">
          <div className="sv-products-header">
            <span className="sv-products-eyebrow">What We Offer</span>
            <h2>Our Services</h2>
            <p>Pick a service below to get an expert technician at your doorstep.</p>
          </div>

          <div className="sv-products-grid">
            {products.map((product) => (
              <Link
                to={product.link}
                key={product.id}
                className="sv-product-card"
              >
                <div className="sv-product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <h3 className="sv-product-title">{product.name}</h3>
                <span className="sv-product-link">
                  View More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Service;