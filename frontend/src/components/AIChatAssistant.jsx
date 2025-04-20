import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import welcomeMessages from '../data/ai/welcomeMessages';
import learningObjectives from '../data/ai/learningObjectives';
import BinaryQuizModal from './digital_electronics/number_systems/BinaryQuizModal';

const AIChatAssistant = ({
  topicId = "general",
  subtopicId = "number_systems",
  nestedSubtopicId = "binary",
  onProgressUpdate,
  onScoreUpdate
}) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  const [objectiveEvidence, setObjectiveEvidence] = useState({});
  const [aiScore, setAiScore] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const [showWelcomeBox, setShowWelcomeBox] = useState(true);
  const [firstPromptSent, setFirstPromptSent] = useState(false);
  const [completionMessageSent, setCompletionMessageSent] = useState(false);

  const formattedTitle = nestedSubtopicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const welcomeMessageFn = welcomeMessages[nestedSubtopicId];
  const objectives = (learningObjectives[topicId]?.[subtopicId]?.[nestedSubtopicId]) || [];
  const welcomeMessage = welcomeMessageFn
    ? (typeof welcomeMessageFn === 'function' ? welcomeMessageFn(formattedTitle) : welcomeMessageFn)
    : welcomeMessages['general'](formattedTitle);

  useEffect(() => {
    if (chat.length === 0) {
      setChat([]);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);

  
  useEffect(() => {
    if (aiScore !== null && aiScore > 0) {
      const saveAIScore = async () => {
        try {
          await fetch("http://localhost:8000/save-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: localStorage.getItem("student_id"), // Replace with actual user ID from session/auth
              topic: "digital_electronics",
              subtopic: "number_systems",
              nested_subtopic: "binary",
              quiz_score: 0,
              ai_score: aiScore,
              assignment_score: 0,
              activity_id: "de_ns_bin_001"
            }),
          });
          console.log("✅ AI score saved.");
        } catch (error) {
          console.error("❌ Failed to save AI score:", error);
        }
      };
      saveAIScore();
    }
  }, [aiScore]);


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
      let modifiedMessage = messageToSend.toLowerCase();
      let reply = '';

      if (!firstPromptSent && /\b(quiz|help|practice)\b/.test(modifiedMessage)) {
        reply = "Let's begin with the basics: What is the difference between the decimal and binary number systems?";
        setFirstPromptSent(true);
      } else {
        const res = await axios.post('http://localhost:8000/chat', {
          message: messageToSend,
          topic_id: nestedSubtopicId,
          history: updatedChat,
          objectives
        });

        reply = res.data.reply;
        const progressFlags = res.data.progress || [];

        if (Array.isArray(progressFlags)) {
          const newScore = calculateGrade(progressFlags);

          setObjectiveEvidence(prevEvidence => {
            const updatedEvidence = { ...prevEvidence };
            progressFlags.forEach((flag, i) => {
              if (flag === true) {
                updatedEvidence[i] = (updatedEvidence[i] || 0) + 1;
              }
            });

            setObjectiveProgress(prevProgress => {
              return progressFlags.map((flag, i) => {
                const count = updatedEvidence[i] || 0;
                if (prevProgress[i] === true) return true;
                if (count >= 2) return true;
                if (flag === true || flag === 'partial') return 'partial';
                return prevProgress[i] || false;
              });
            });

            return updatedEvidence;
          });

          setAiScore(prevScore => {
            const updatedScore = Math.max(prevScore ?? 0, newScore);
            if (typeof onScoreUpdate === 'function') onScoreUpdate(updatedScore);
            return updatedScore;
          });

          const bestScore = quizScore !== null ? Math.max(quizScore, newScore) : newScore;
          if (typeof onProgressUpdate === 'function') onProgressUpdate(progressFlags, bestScore);

          const allCompleted = progressFlags.length > 0 && progressFlags.every(p => p === true);
          if (allCompleted && !completionMessageSent) {
            reply += "\n\n✅ Awesome work! You've demonstrated a strong understanding of this topic. You can take the quiz to challenge yourself further, or just keep exploring other pages—I'll be here to help on your next topic!";
            setCompletionMessageSent(true);
          }
        }
      }

      setChat(prev => [...prev, { role: 'assistant', content: reply }]);
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
    if (typeof onProgressUpdate === 'function') onProgressUpdate(objectiveProgress, best);
    if (typeof onScoreUpdate === 'function') onScoreUpdate(best);
  };

  return (
    <div className="min-h-[95vh] max-h-[120vh] flex flex-col bg-gray-50 rounded shadow">
      {showWelcomeBox && (
        <div className="bg-gray-200 px-4 py-3 mb-2 rounded-md shadow-sm text-sm text-gray-800 w-full">
          <p>🎓 <strong>Welcome!</strong> I'm your AI Assistant here to help you learn about <strong>{formattedTitle}</strong>.</p>
          <p>You can ask questions, practice problems, or explore concepts.</p>
          <p>🧠 At any point, you can take the <strong>{formattedTitle} Quiz</strong> to earn credit toward completing this module. Scroll down to ask questions in chat box.</p>
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