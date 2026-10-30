import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  FaWrench, FaCalendarAlt, FaMapMarkerAlt, FaPhone,
  FaCheckCircle, FaArrowLeft,
} from 'react-icons/fa';
import { serviceApi } from '../../api';
import { StoreContext } from '../../context/StoreContext';
import './ServiceBookingForm.css';

const ServiceBookingForm = ({
  serviceType,
  serviceTitle,
  serviceDescription,
  onBack,
}) => {
  const navigate = useNavigate();
  const { token } = useContext(StoreContext);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const [formData, setFormData] = useState({
    service_type: serviceType,
    description: '',
    preferred_date: '',
    address: '',
    phone: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData((prev) => ({
      ...prev,
      preferred_date: tomorrow.toISOString().split('T')[0],
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.warning('Please login to book a service');
      navigate('/');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        service_type: formData.service_type,
        description: formData.description,
        preferred_date: formData.preferred_date || null,
        address: [
          formData.address,
          formData.city,
          formData.state,
          formData.zip_code,
        ]
          .filter(Boolean)
          .join(', '),
        phone: formData.phone,
      };

      const result = await serviceApi.createServiceRequest(payload);
      setRequestId(result.id);
      setSubmitted(true);
      toast.success('Service request submitted!');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.detail || 'Failed to book service');
    } finally {
      setLoading(false);
    }
  };

  // ═══ SUCCESS STATE ═══
  if (submitted) {
    return (
      <div className="sb-page">
        <div className="sb-success">
          <div className="sb-success-icon">
            <FaCheckCircle />
          </div>
          <h2>Service Request Confirmed!</h2>
          <p>
            Your {serviceTitle} request has been submitted. A technician will
            contact you within 24 hours to confirm the schedule.
          </p>

          <div className="sb-success-info">
            <div>
              <span>Request ID</span>
              <strong>#{requestId}</strong>
            </div>
            <div>
              <span>Service</span>
              <strong>{serviceTitle}</strong>
            </div>
            <div>
              <span>Preferred Date</span>
              <strong>
                {new Date(formData.preferred_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
            </div>
          </div>

          <div className="sb-success-actions">
            <button
              className="sb-btn primary"
              onClick={() => navigate('/my-service-requests')}
            >
              View My Requests
            </button>
            <button
              className="sb-btn secondary"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ FORM STATE ═══
  return (
    <div className="sb-page">
      <div className="sb-header">
        {onBack && (
          <button className="sb-back-btn" onClick={onBack} type="button">
            <FaArrowLeft /> Back
          </button>
        )}
        <div className="sb-header-content">
          <div className="sb-header-icon">
            <FaWrench />
          </div>
          <div>
            <h1>{serviceTitle} Booking</h1>
            <p>{serviceDescription}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="sb-form">
        {/* Issue Description */}
        <div className="sb-section">
          <h3 className="sb-section-title">Problem Details</h3>

          <div className="sb-field">
            <label>
              <FaWrench /> Describe the issue *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., AC not cooling properly, unusual noise from outdoor unit..."
              rows={4}
              required
            />
          </div>

          <div className="sb-field">
            <label>
              <FaCalendarAlt /> Preferred date *
            </label>
            <input
              type="date"
              name="preferred_date"
              value={formData.preferred_date}
              onChange={handleChange}
              min={today}
              required
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="sb-section">
          <h3 className="sb-section-title">Contact Details</h3>

          <div className="sb-field">
            <label>
              <FaPhone /> Phone number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="sb-section">
          <h3 className="sb-section-title">
            <FaMapMarkerAlt /> Service Address
          </h3>

          <div className="sb-field">
            <label>Street / Building *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat 4B, Green Valley Apartments, MG Road"
              required
            />
          </div>

          <div className="sb-grid-2">
            <div className="sb-field">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
              />
            </div>
            <div className="sb-field">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="sb-field">
            <label>PIN Code</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="400001"
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="sb-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="sb-spinner-small"></span>
              Submitting...
            </>
          ) : (
            <>
              <FaCheckCircle /> Confirm Booking
            </>
          )}
        </button>

        <p className="sb-disclaimer">
          By submitting, you agree to be contacted by our team. No payment is
          required at this step.
        </p>
      </form>
    </div>
  );
};

ServiceBookingForm.propTypes = {
  serviceType: PropTypes.string.isRequired,
  serviceTitle: PropTypes.string.isRequired,
  serviceDescription: PropTypes.string,
  onBack: PropTypes.func,
};

ServiceBookingForm.defaultProps = {
  serviceDescription: '',
  onBack: null,
};

export default ServiceBookingForm;