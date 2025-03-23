// src/components/AIChatAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIChatAssistant = ({ topicId = "general" }) => {
  console.log("✅ AIChatAssistant mounted for topic:", topicId);

  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  // Auto-fetch AI greeting on first load
  useEffect(() => {
    const fetchInitialGreeting = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:8000/chat', {
          message: "",
          topic_id: topicId,
          history: []
        });
        const botReply = { role: 'assistant', content: res.data.reply };
        setChat([botReply]);
      } catch (err) {
        console.error("Failed to fetch greeting:", err);
        setChat([{ role: 'assistant', content: "⚠️ Failed to load assistant." }]);
      } finally {
        setLoading(false);
      }
    };

    if (chat.length === 0) {
      fetchInitialGreeting();
    }
  }, [topicId]);

  // Send user message + get AI reply
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    const updatedChat = [...chat, newMessage];

    setChat(updatedChat);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: input,
        topic_id: topicId,
        history: chat
      });
      const botReply = { role: 'assistant', content: res.data.reply };
      setChat(prev => [...prev, botReply]);
    } catch (err) {
      console.error("Chat error:", err);
      setChat(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Sorry, something went wrong."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Ask the AI Assistant</h3>
      <div className="border rounded p-4 bg-gray-50 h-[75vh] flex-col">
        <div className="flex-grow overflow-y-auto mb-4 space-y-2">
          {chat.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded text-left max-w-full prose prose-sm ${
                msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'
              }`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-gray-500">Thinking...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
