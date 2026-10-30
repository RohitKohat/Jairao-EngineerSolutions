import { useEffect, useState, useRef } from "react";
import "../../assets/css/style.css";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    className: "slide-bg-1",
    eyebrow: "Premium Appliances",
    title: "Home Appliances",
    desc: "Shop Now for Smart, Reliable, and Modern Home Appliances.",
    buttons: (navigate) => (
      <div className="mt-4 d-flex gap-3 flex-wrap">
        <button className="btn btn-secondary" onClick={() => navigate("/shop")}>Shop Now</button>
        <button className="btn btn-white-outline" onClick={() => navigate("/shop")}>Explore</button>
      </div>
    ),
  },
  {
    className: "slide-bg-2",
    eyebrow: "Fast & Reliable",
    title: "Expert Services",
    desc: "Get Trusted Home Appliance Services Now – Fast, Efficient, and Hassle‑Free.",
    buttons: (navigate) => (
      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/Service")}>Get Service Now</button>
      </div>
    ),
  },
  {
    className: "slide-bg-3",
    eyebrow: "Clean Energy",
    title: "Solar Solutions",
    desc: "Keep your solar panels working efficiently year‑round with our expert maintenance.",
    buttons: (navigate) => (
      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/solar")}>Get Solar Quote</button>
      </div>
    ),
  },
];

const Header = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
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
    <div className="hero-carousel-header" onMouseEnter={stopInterval} onMouseLeave={startInterval}>
      
      {/* Slide counter */}
      <div className="hc-counter">
        {String(activeSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hc-slide ${slide.className} ${index === activeSlide ? "hc-slide--active" : ""}`}
        >
          <div className="container h-100 d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
            <div className="row w-100">
              <div className="col-lg-8 col-xl-7 text-white">
                <span className="hc-eyebrow">{slide.eyebrow}</span>
                <h1 className="hc-title">{slide.title}</h1>
                <p className="hc-desc">{slide.desc}</p>
                {slide.buttons(navigate)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Progress dots */}
      <div className="hc-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hc-dot ${index === activeSlide ? "hc-dot--active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;