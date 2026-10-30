import { useState, useEffect, useRef, useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./AIChat.css";

const SUGGESTIONS = [
  "What services do you offer?",
  "Tell me about the company",
  "Do you install solar panels?",
  "How can I contact you?",
];

const WELCOME_MESSAGE = `Hello! 👋 Welcome to **Jairao Engineer Solution**.

I am your personal AI assistant here to help you with:
• ☀️ Solar installations
• ❄️ AC repair & service
• 🧺 Washing machine repair
• 💧 Water purifier service
• 🧊 Refrigerator repair

How can I help you today?`;

const AIChat = () => {
  const { url } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const history = updatedMessages
        .filter((m, i) => i !== 0) // skip welcome
        .slice(0, -1)
        .slice(-10);

      const response = await fetch(`${url}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.message ||
              "Sorry, I couldn't process that. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="ai-chat-wrapper">
      {!isOpen && (
        <button className="ai-chat-toggle" onClick={() => setIsOpen(true)}>
          <span className="ai-pulse"></span>
          💬 Ask AI
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <span className="ai-status-dot"></span>
              <h4>Jairao AI Assistant</h4>
            </div>
            <button
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✖
            </button>
          </div>

          <div className="ai-chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} style={{ margin: "2px 0" }}>
                    {line}
                  </p>
                ))}
              </div>
            ))}

            {isTyping && (
              <div className="ai-message assistant typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            {/* Quick suggestions */}
            {showSuggestions && messages.length === 1 && (
              <div className="ai-suggestions">
                <p className="ai-suggestions-label">Try asking:</p>
                <div className="ai-suggestions-list">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="ai-suggestion-chip"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask about our services..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;