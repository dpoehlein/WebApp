// C:/SST/WebApp/frontend/src/components/AIChatAssistant.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import welcomeMessages from '../data/ai/welcomeMessages';
import learningObjectives from '../data/ai/learningObjectives';
import BinaryQuizModal from './digital_electronics/number_systems/BinaryQuizModal';

const AIChatAssistant = ({ topicId = "general", subtopicId = "number_systems", nestedSubtopicId = "binary", onProgressUpdate }) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  const [aiScore, setAiScore] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const [objectiveIndex, setObjectiveIndex] = useState(0);
  const [showWelcomeBox, setShowWelcomeBox] = useState(true);

  const formattedTitle = nestedSubtopicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const welcomeMessageFn = welcomeMessages[nestedSubtopicId];
  const objectives = (learningObjectives[topicId]?.[subtopicId]?.[nestedSubtopicId]) || [];

  const welcomeMessage = welcomeMessageFn
    ? (typeof welcomeMessageFn === 'function' ? welcomeMessageFn(formattedTitle) : welcomeMessageFn)
    : welcomeMessages['general'](formattedTitle);

  useEffect(() => {
    if (chat.length === 0) {
      setChat([]); // Start empty, display welcome box separately
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const calculateGrade = (progressFlags) => {
    const total = progressFlags.length;
    const score = progressFlags.reduce((acc, p) => acc + (p === true ? 1 : p === 'partial' ? 0.5 : 0), 0);
    return total > 0 ? Math.round((score / total) * 100) : 0;
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
        topic_id: nestedSubtopicId,
        history: updatedChat,
        objectives
      });

      let finalReply = res.data.reply;
      const progressFlags = res.data.progress || [];

      if (Array.isArray(progressFlags)) {
        const newScore = calculateGrade(progressFlags);

        if (newScore >= 80 && (aiScore === null || aiScore < 80)) {
          finalReply += '\n\n✅ It looks like you\'re ready to take the quiz!';
        }

        setObjectiveProgress(prev => {
          return progressFlags.map((newVal, i) => {
            const oldVal = prev[i];
            if (oldVal === true) return true;
            if (newVal === true) return true;
            if (oldVal === 'partial' && newVal === false) return 'partial';
            return newVal;
          });
        });

        const bestScore = quizScore !== null ? Math.max(quizScore, newScore) : newScore;
        if (typeof onProgressUpdate === 'function') {
          onProgressUpdate(progressFlags, bestScore);
        }

        setAiScore(newScore);
      }

      setChat(prev => [...prev, { role: 'assistant', content: finalReply }]);

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

  const handleQuizComplete = ({ score }) => {
    setQuizScore(score);
    const best = aiScore !== null ? Math.max(aiScore, score) : score;
    if (typeof onProgressUpdate === 'function') {
      onProgressUpdate(objectiveProgress, best);
    }
  };

  return (
    <div className="min-h-[95vh] max-h-[120vh] flex flex-col bg-gray-50 rounded shadow">

      {showWelcomeBox && (
        <div className="bg-gray-200 px-4 py-3 mb-2 rounded-md shadow-sm text-sm text-gray-800 w-full">
          <p>🎓 <strong>Welcome!</strong> I'm your AI Assistant here to help you learn about <strong>{formattedTitle}</strong>.</p>
          <p>You can ask questions, practice problems, or explore concepts.</p>
          <p>🧠 At any point, you can take the <strong>{formattedTitle} Quiz</strong> to earn credit toward completing this module.</p>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {chat.map((msg, idx) => (
          <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded text-left max-w-full ${msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">Thinking...</div>}
      </div>

      <div className="p-4 border-t bg-white">
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

      <BinaryQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
};

export default AIChatAssistant;