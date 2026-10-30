import React, { useState, useEffect } from "react";
import axios from "axios";
import "./feedback.css";

const Feedback = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [feedbackList, setFeedbackList] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback");
      setFeedbackList(res.data);
    } catch (error) {
      console.error("❌ Error fetching feedback:", error);
      setErrorMessage("❌ Error fetching feedback!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/feedback", formData);
      setResponseMessage(res.data.message);
      setErrorMessage("");
      setFormData({ name: "", email: "", message: "" });
      fetchFeedback(); // Refresh feedback list
    } catch (error) {
      setResponseMessage("");
      setErrorMessage("❌ Error submitting feedback!");
    }
  };

  return (
    <div className="feedback-container">
      <h2 className="feedback-title">Give Us Your Feedback</h2>
      {responseMessage && <p className="success-message">{responseMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="feedback-form">
        <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
        <textarea name="message" placeholder="Your Feedback" value={formData.message} onChange={handleChange} required></textarea>
        <button type="submit">Submit</button>
      </form>

      <h3 className="recent-feedback-title">Recent Feedback</h3>
      <ul className="feedback-list">
        {feedbackList.length > 0 ? (
          feedbackList.map((feedback, index) => (
            <li key={index} className="feedback-item">
              <strong>{feedback.name}</strong>: {feedback.message}
            </li>
          ))
        ) : (
          <p>No feedback available.</p>
        )}
      </ul>
    </div>
  );
};

export default Feedback;
