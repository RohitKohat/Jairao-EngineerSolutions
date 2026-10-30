import { useState } from 'react';
import axios from 'axios';
import { FaLocationArrow } from 'react-icons/fa';
import { MdEmail, MdCall } from 'react-icons/md';
import heroImage1 from '../assets/images/7491837b-0ef5-4a4d-a150-2326a5ef4316.png';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState(''); // "success" | "error"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');
    setResponseType('');

    try {
      // ✅ Updated to new backend port (8000)
      const response = await axios.post(
        'http://localhost:8000/api/contact',
        formData
      );
      setResponseMessage(
        response.data.message || 'Message sent successfully!'
      );
      setResponseType('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      setResponseMessage('Failed to send message. Please try again.');
      setResponseType('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      
      {/* ---------- Hero Section ---------- */}
      <section className="contact-hero">
        <div className="contact-hero-container">
          <div className="contact-hero-text">
            
            {/* ✅ Removed the small "GET IN TOUCH" badge here */}
            <h1>We would love to hear from you</h1>
            <p>
              Have a question about our services or need a quote? Send us a
              message and our team will respond within 24 hours.
            </p>
            
            <div className="contact-hero-badges">
              <span className="hero-badge">⚡ Fast Response</span>
              <span className="hero-badge">🛠️ Expert Team</span>
              <span className="hero-badge">⭐ Trusted Service</span>
            </div>
          </div>
          
          <div className="contact-hero-image">
            <img src={heroImage1} alt="Contact us" />
          </div>
        </div>
      </section>

      {/* ---------- Info Cards ---------- */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaLocationArrow size={22} />
            </div>
            <div className="contact-info-text">
              <h4>Visit Us</h4>
              <p>
                12 near Hanuman Temple, Chota Tajbagh Square, Nagpur - 440034
              </p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <MdEmail size={24} />
            </div>
            <div className="contact-info-text">
              <h4>Email Us</h4>
              <p>
                <a href="mailto:jayraoengineersolutions@gmail.com">
                  jayraoengineersolutions@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <MdCall size={24} />
            </div>
            <div className="contact-info-text">
              <h4>Call Us</h4>
              <p>
                <a href="tel:+918806732711">+91 88067 32711</a>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ---------- Form Section ---------- */}
      <section className="contact-form-section">
        <div className="contact-form-container">
          <div className="contact-form-header">
            <h2>Send Us a Message</h2>
            <p>Fill out the form and we will get back to you shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  pattern="[0-9+\-\s()]{7,15}"
                  title="Please enter a valid phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea
                name="message"
                id="message"
                className="form-control"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help you..."
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Sending...
                </>
              ) : (
                <>Send Message →</>
              )}
            </button>

            {responseMessage && (
              <div className={`contact-response ${responseType}`}>
                <span className="response-icon">
                  {responseType === 'success' ? '✓' : '✕'}
                </span>
                {responseMessage}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ---------- Map Section ---------- */}
      <section className="contact-map-section">
        <div className="contact-map-wrapper">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m26!1m12!1m3!1d3721.7240857100383!2d79.11101097471695!3d21.123563584516717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m11!3e6!4m3!3m2!1d21.1236773!2d79.113697!4m5!1s0x3bd4c78d72e96a89%3A0x25bd5a83d81ee096!2sChota%20Taj%20Bagh%20Rd%2C%20near%20HANUMAN%20TEMPLE%2C%20Ayurvedic%20Layout%2C%20SQURE%2C%20Nagpur%2C%20Maharashtra%20440024!3m2!1d21.123679499999998!2d79.1134756!5e0!3m2!1sen!2sin!4v1740745187516!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

    </div>
  );
};

export default Contact;