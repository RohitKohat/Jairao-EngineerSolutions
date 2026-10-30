import { Link } from 'react-router-dom';
import './Footer.css';
import { 
  FaTelegramPlane, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-section">
      
      {/* --- 1. FULL-WIDTH NEWSLETTER BANNER --- */}
      <div className="newsletter-banner-full">
        <div className="container">
          <div className="row align-items-center">
            
            {/* Left: Text */}
            <div className="col-lg-5 mb-4 mb-lg-0 text-center text-lg-start">
              <h3 className="mb-2">Subscribe to our Newsletter</h3>
              <p className="mb-0">
                Get the latest updates on solar installations, service offers, and maintenance tips.
              </p>
            </div>
            
            {/* Right: Form */}
            <div className="col-lg-7">
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="form-control" 
                  required 
                />
                <button type="submit" className="btn btn-secondary">
                  Subscribe
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* --- 2. MAIN FOOTER LINKS --- */}
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Column 1: Brand & Socials */}
          <div className="col-lg-4 col-md-6">
            <h4 className="footer-brand-text mb-3">Jairao Engineer Solution</h4>
            <p className="mb-4 pe-lg-5">
              Specializing in the sales and servicing of high-quality home appliances and solar systems, ensuring a seamless experience for our customers.
            </p>
            <ul className="list-unstyled custom-social d-flex gap-3">
              <li>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <FaTelegramPlane size={20} />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter size={20} />
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram size={20} />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin size={20} />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="footer-heading">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/aboutus">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="col-lg-3 col-md-6 col-6">
            <h5 className="footer-heading">Our Services</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/solar">Solar Installation</Link></li>
              <li><Link to="/Services/ac">AC Repair &amp; Service</Link></li>
              <li><Link to="/Services/washingMachine">Washing Machine</Link></li>
              <li><Link to="/Services/waterPurifier">Water Purifier</Link></li>
              <li><Link to="/Services/refrigerator">Refrigerator Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h5 className="footer-heading">Get In Touch</h5>
            <ul className="list-unstyled footer-contact">
              <li className="d-flex gap-3 mb-3">
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 Engineering Street, City, State 123456</span>
              </li>
              <li className="d-flex gap-3 mb-3">
                <FaPhone className="contact-icon" />
                <span>+91 98765 43210</span>
              </li>
              <li className="d-flex gap-3 mb-3">
                <FaEnvelope className="contact-icon" />
                <span>support@jairaosolutions.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    
      {/* --- 3. COPYRIGHT BAR --- */}
      <div className="border-top copyright py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">
                Copyright &copy; {new Date().getFullYear()} Jairao Engineer Solution. All Rights Reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
              <ul className="list-unstyled d-inline-flex m-0 gap-4">
                <li><a href="#!">Terms &amp; Conditions</a></li>
                <li><Link to="/privacypolicy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;