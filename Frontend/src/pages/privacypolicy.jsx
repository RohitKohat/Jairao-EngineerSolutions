import { FaInfoCircle, FaShieldAlt, FaDatabase, FaUserShield, FaSyncAlt, FaLock } from 'react-icons/fa';
import './privacypolicy.css';

const policies = [
  {
    id: 1,
    icon: <FaDatabase />,
    title: 'Information We Collect',
    content:
      'We may collect personal information, such as your name, email address, and payment details when you make a purchase.',
  },
  {
    id: 2,
    icon: <FaUserShield />,
    title: 'How We Use Your Information',
    content:
      'We use your information to process transactions, improve our services, and ensure the security of our platform.',
  },
  {
    id: 3,
    icon: <FaLock />,
    title: 'Third-Party Services',
    content:
      'We may share your data with trusted third-party services to enhance your experience and process payments securely.',
  },
  {
    id: 4,
    icon: <FaShieldAlt />,
    title: 'Security',
    content:
      'We implement advanced security measures to protect your information from unauthorized access.',
  },
  {
    id: 5,
    icon: <FaSyncAlt />,
    title: 'Changes to This Policy',
    content:
      'We may update this Privacy Policy periodically. Please review it regularly to stay informed of any changes.',
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      
      {/* ---------- Hero Section ---------- */}
      <section className="privacy-hero">
        <div className="privacy-hero-container">
          <div className="privacy-hero-icon">
            <FaShieldAlt />
          </div>
          <h1 className="privacy-hero-title">Privacy Policy</h1>
          <p className="privacy-hero-subtitle">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </section>

      {/* ---------- Content ---------- */}
      <section className="privacy-section">
        <div className="privacy-container">
          
          {/* Intro Card */}
          <div className="privacy-intro">
            <div className="privacy-intro-icon">
              <FaInfoCircle />
            </div>
            <p>
              Your privacy is important to us. This Privacy Policy explains how
              we collect, use, and protect your information when you visit our
              e-commerce website.
            </p>
          </div>

          {/* Policy Cards */}
          <div className="privacy-grid">
            {policies.map((policy, index) => (
              <div key={policy.id} className="privacy-card">
                <div className="privacy-card-header">
                  <div className="privacy-card-icon">{policy.icon}</div>
                  <span className="privacy-card-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="privacy-card-title">{policy.title}</h2>
                <p className="privacy-card-text">{policy.content}</p>
              </div>
            ))}
          </div>

          {/* Contact Note */}
          <div className="privacy-contact-note">
            <h3>Questions about your privacy?</h3>
            <p>
              If you have any concerns about how we handle your data, please
              reach out to us at{' '}
              <a href="mailto:jayraoengineersolutions@gmail.com">
                jayraoengineersolutions@gmail.com
              </a>
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default PrivacyPolicy;