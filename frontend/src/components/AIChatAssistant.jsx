import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import welcomeMessages from '../data/ai/welcomeMessages';
import learningObjectives from '../data/ai/learningObjectives';

const AIChatAssistant = ({ topicId = "general", onProgressUpdate }) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  const [mode, setMode] = useState(null);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const chatContainerRef = useRef(null);

  const formattedTitle = topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const welcomeMessageFn = welcomeMessages[topicId];
  const objectives = learningObjectives[topicId] || [];

  const welcomeMessage = welcomeMessageFn
    ? (typeof welcomeMessageFn === 'function' ? welcomeMessageFn(formattedTitle) : welcomeMessageFn)
    : welcomeMessages['general'](formattedTitle);

  useEffect(() => {
    if (chat.length === 0) {
      setChat([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [chat]);

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
        topic_id: topicId,
        history: updatedChat,
        objectives: objectives
      });

      const botReply = { role: 'assistant', content: res.data.reply };
      setChat(prev => [...prev, botReply]);

      if (res.data.progress && Array.isArray(res.data.progress)) {
        setObjectiveProgress(res.data.progress);
        const newGrade = calculateGrade(res.data.progress);
        if (typeof onProgressUpdate === 'function') {
          onProgressUpdate(res.data.progress, newGrade);
        }
      }

      setAwaitingAnswer(false);
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
    <div className="min-h-[95vh] max-h-[120vh] flex flex-col bg-gray-50 rounded shadow">
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Ask the AI Assistant</h3>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-2"
      >
        {chat.length <= 1 && (
          <div className="bg-gray-200 p-4 rounded-md shadow-sm">
            <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
          </div>
        )}

        {chat.map((msg, idx) =>
          (idx === 0 && msg.content === welcomeMessage) ? null : (
            <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded text-left max-w-full ${msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )
        )}
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
    </div>
  );
};

export default AIChatAssistant;
