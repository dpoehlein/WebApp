// src/components/AIChatAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIChatAssistant = ({ topicId = "general" }) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState(null); // "explain", "practice", "quiz"
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const welcomeMessage = `👋 Welcome! I'm your AI Assistant here to help you master Binary Numbers.

You can choose how you’d like to get started:

1️⃣ **Explain Binary Numbers** – I’ll walk you through the concept step by step.  
2️⃣ **Give Me a Practice Problem** – Try solving a binary conversion with my help.  
3️⃣ **Quiz Me** – I’ll generate a quick challenge to test your knowledge.

📊 I’ll monitor your progress toward completion as you answer questions in this chat.  
Ready when you are — just click an option or ask me anything!`;

  useEffect(() => {
    if (chat.length === 0) {
      const botReply = { role: 'assistant', content: welcomeMessage };
      setChat([botReply]);
    }
  }, [chat]);

  const handleOptionClick = async (option, selectedMode) => {
    setMode(selectedMode);
    setAwaitingAnswer(selectedMode === 'quiz');
    await sendMessage(option);
  };

  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    const newMessage = { role: 'user', content: messageToSend };
    const updatedChat = [...chat, newMessage];
    setChat(updatedChat);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: messageToSend,
        topic_id: topicId,
        history: updatedChat
      });

      const botReply = { role: 'assistant', content: res.data.reply };
      setChat(prev => [...prev, botReply]);

      if (mode === 'quiz') {
        if (/correct|✅|great job|well done/i.test(res.data.reply)) {
          setProgress(prev => Math.min(prev + 20, 100));
          setAwaitingAnswer(false);

          const nextPrompt = "Next question, please.";
          const nextMessage = { role: 'user', content: nextPrompt };
          const nextChat = [...updatedChat, botReply, nextMessage];
          setChat([...nextChat]);

          const nextRes = await axios.post('http://localhost:8000/chat', {
            message: nextPrompt,
            topic_id: topicId,
            history: nextChat
          });

          const nextReply = { role: 'assistant', content: nextRes.data.reply };
          setChat(prev => [...prev, nextReply]);
          setAwaitingAnswer(true);
        } else {
          setAwaitingAnswer(true);
        }
      }

    } catch (err) {
      console.error("Chat error:", err);
      setChat(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Sorry, something went wrong."
      }]);
      setAwaitingAnswer(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6 mt-8">
      {/* Header with Top Progress Bar */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Ask the AI Assistant</h3>
        <div className="w-40 h-2 bg-gray-200 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Assistant Container */}
      <div className="border rounded p-4 bg-gray-50 h-[85vh] flex flex-col">
        {/* Scrollable Chat Window */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
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

        {/* Initial Option Buttons */}
        {chat.length <= 1 && (
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={() => handleOptionClick("Explain Binary Numbers", "explain")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Explain Binary Numbers
            </button>
            <button
              onClick={() => handleOptionClick("Give Me a Practice Problem", "practice")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Give Me a Practice Problem
            </button>
            <button
              onClick={() => handleOptionClick("Quiz Me", "quiz")}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Quiz Me
            </button>
          </div>
        )}

        {/* Bottom Progress Bar */}
        <div className="mb-2">
          <div className="text-sm text-gray-600 mb-1">Your Progress</div>
          <div className="w-full h-2 bg-gray-200 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
