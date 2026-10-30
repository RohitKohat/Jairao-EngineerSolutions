import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Accordion } from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "./support.css";

const Support = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000); // Hide success message after 3 sec
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Container className="support-container">
      <Row className="single-row">
        <Col md={12}>
          <h2 className="support-heading text-center">Support & Help Center</h2>

          {/* Contact Options */}
          <div className="contact-options d-flex justify-content-between">
            <div className="contact-box">
              <FaPhoneAlt size={30} className="icon" />
              <h5>Call Us</h5>
              <p>+91 98765 43210</p>
            </div>
            <div className="contact-box">
              <FaEnvelope size={30} className="icon" />
              <h5>Email</h5>
              <p>support@yourstore.com</p>
            </div>
          </div>

          {/* FAQ Section */}
          <h4 className="faq-heading">Frequently Asked Questions</h4>
          <Accordion className="faq-section">
            {[
              { key: "0", question: "📦 How can I track my order?", answer: "Log in to your account, go to My Orders, and check the tracking details." },
              { key: "1", question: "🔄 What is the return policy?", answer: "We offer a 7-day return policy. Contact support for assistance." },
              { key: "2", question: "❌ How can I cancel my order?", answer: "Orders can be canceled within 24 hours of placing them. Go to My Orders and select 'Cancel'." },
              { key: "3", question: "💳 What payment methods do you accept?", answer: "We accept Credit/Debit Cards, Net Banking, UPI, and Wallets." },
              { key: "4", question: "🚚 How long does shipping take?", answer: "Standard delivery takes 3-5 business days, and express shipping takes 1-2 days." },
            ].map((faq) => (
              <Accordion.Item eventKey={faq.key} key={faq.key}>
                <Accordion.Header>{faq.question}</Accordion.Header>
                <Accordion.Body>{faq.answer}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          {/* Contact Form */}
          
        </Col>
      </Row>
    </Container>
  );
};

export default Support;
