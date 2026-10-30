import { Link } from "react-router-dom";
import aboutImage from "../assets/images/mechanic-with-laptop-white-background_1368-4145.png";
import "./aboutus.css";

const AboutUs = () => {
  return (
    <div className="about-page">
      
      {/* ---------- Hero Section ---------- */}
      <section className="about-hero">
        <div className="about-hero-container">
          
          {/* Left: Text */}
          <div className="about-hero-text">
            <span className="about-eyebrow">Who We Are</span>
            <h1 className="about-title">
              About <span>Jay Rao Engineer Solutions</span>
            </h1>
            <p className="about-subtitle">
              A comprehensive service provider specializing in sales, repair,
              maintenance, and installation of household &amp; commercial
              appliances.
            </p>

            {/* Feature chips */}
            <div className="about-chips">
              <span className="about-chip">🔧 Expert Repairs</span>
              <span className="about-chip">🏠 Home Appliances</span>
              <span className="about-chip">☀️ Solar Solutions</span>
              <span className="about-chip">⚡ Fast Service</span>
            </div>

            <Link to="/shop" className="about-cta">
              Shop Now →
            </Link>
          </div>

          {/* Right: Image */}
          <div className="about-hero-image">
            <div className="about-image-glow"></div>
            <img src={aboutImage} alt="About Jay Rao Engineer Solutions" />
          </div>

        </div>
      </section>

      {/* ---------- Story Section ---------- */}
      <section className="about-story">
        <div className="about-story-container">
          
          <div className="about-story-header">
            <span className="about-eyebrow-dark">Our Story</span>
            <h2>Built on engineering expertise</h2>
          </div>

          <div className="about-story-content">
            <p className="about-description">
              Welcome to our shopping experience, where we offer high-quality
              products at the best prices. Jay Rao Engineer Solutions is a
              comprehensive service provider specializing in the sales, repair,
              maintenance, and installation of various household and commercial
              appliances.
            </p>

            <p className="about-description">
              Founded on <strong>1 May 2019</strong> by{" "}
              <strong>Er. Sanyog D Uikey</strong>, a seasoned mechanical engineer
              with extensive experience, our company is committed to delivering
              high-quality solutions tailored to meet the specific needs of our
              clients.
            </p>

            <p className="about-description">
              Join us in revolutionizing the home appliances and engineering
              services world. Your satisfaction is our priority.
            </p>
          </div>

          {/* Stats */}
          <div className="about-stats">
            <div className="about-stat-card">
              <div className="about-stat-icon">📅</div>
              <div className="about-stat-number">2019</div>
              <div className="about-stat-label">Founded</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-icon">🎓</div>
              <div className="about-stat-number">Engineer</div>
              <div className="about-stat-label">Led Team</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-icon">🏆</div>
              <div className="about-stat-number">5+</div>
              <div className="about-stat-label">Years Experience</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-icon">⭐</div>
              <div className="about-stat-number">1000+</div>
              <div className="about-stat-label">Happy Customers</div>
            </div>
          </div>

        </div>
      </section>

      {/* ---------- CTA Section ---------- */}
      <section className="about-cta-section">
        <div className="about-cta-container">
          <h2>Ready to get started?</h2>
          <p>
            Browse our products or contact us for a personalized consultation.
          </p>
          <div className="about-cta-buttons">
            <Link to="/shop" className="about-cta-primary">
              Shop Now
            </Link>
            <Link to="/contact" className="about-cta-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;