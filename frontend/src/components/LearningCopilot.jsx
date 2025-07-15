import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import welcomeMessages from '../data/ai/welcomeMessages';

const LearningCopilot = ({
  topicId = "general",
  subtopicId = "number_systems",
  nestedSubtopicId = "binary",
  objectives = [],
  objectiveProgress = [],
  onProgressUpdate,
  onScoreUpdate,
  QuizModal
}) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectiveEvidence, setObjectiveEvidence] = useState({});
  const [aiScore, setAiScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const [firstPromptSent, setFirstPromptSent] = useState(false);
  const [completionMessageSent, setCompletionMessageSent] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const studentId = localStorage.getItem("student_id");

  const formattedTitle = nestedSubtopicId.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase());
  const welcomeMessageFn = welcomeMessages[nestedSubtopicId];
  const welcomeMessage = welcomeMessageFn
    ? (typeof welcomeMessageFn === 'function' ? welcomeMessageFn(formattedTitle) : welcomeMessageFn)
    : welcomeMessages['general'](formattedTitle);

  useEffect(() => {
    async function fetchSavedProgress() {
      if (!studentId) return;

      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-progress`, {
          params: {
            student_id: studentId,
            topic: topicId,
            subtopic: subtopicId,
            nested_subtopic: nestedSubtopicId,
          },
        });

        const { objective_progress = [], ai_score = 0, quiz_score = 0 } = res.data || {};

        if (typeof onProgressUpdate === "function")
          onProgressUpdate([...objective_progress]);
        if (typeof onScoreUpdate === "function")
          onScoreUpdate(ai_score);

        setAiScore(ai_score);
        setQuizScore(quiz_score);
        setProgressLoaded(true);
      } catch (error) {
        console.error("Failed to load saved progress", error);
        setProgressLoaded(true);
      }
    }

    fetchSavedProgress();
  }, [topicId, subtopicId, nestedSubtopicId, onProgressUpdate, onScoreUpdate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const calculateGrade = (progressFlags) => {
    const total = progressFlags.length;
    const score = progressFlags.reduce((acc, p) => acc + (p === true ? 1 : p === 'progress' ? 0.5 : 0), 0);
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  const persistProgress = async (flags, quiz, ai, source = "ai") => {
    const studentId = localStorage.getItem("student_id");

    if (
      !studentId ||
      !topicId || topicId === "undefined" ||
      !subtopicId || subtopicId === "undefined" ||
      !nestedSubtopicId || nestedSubtopicId === "undefined"
    ) {
      console.warn("⛔ Skipping persistProgress due to missing parameters", {
        studentId,
        topicId,
        subtopicId,
        nestedSubtopicId
      });
      return;
    }

    console.log("💾 Persisting progress:", {
      flags,
      quiz,
      ai,
      source
    });

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          topic: topicId,
          subtopic: subtopicId,
          nested_subtopic: nestedSubtopicId,
          ai_objective_progress: source === "ai" ? flags : undefined,
          quiz_objective_progress: source === "quiz" ? flags : undefined,
          ai_score: source === "ai" ? ai : undefined,
          quiz_score: source === "quiz" ? quiz : undefined,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to persist progress:", err);
    }
  };  

  const sendMessage = async (customMessage = null) => {
    if (!progressLoaded) return;
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    const newMessage = { role: 'user', content: messageToSend };
    const updatedChat = [...chat, newMessage];
    setChat(updatedChat);
    setInput('');
    setLoading(true);

    if (!firstPromptSent) setCompletionMessageSent(false);

    try {
      let reply = '';

      if (!firstPromptSent && /(quiz|help|practice)/.test(messageToSend.toLowerCase())) {
        reply = "Let's begin with the basics: What is the difference between the decimal and binary number systems?";
        setChat(prev => [...prev, { role: 'assistant', content: reply }]);
        setFirstPromptSent(true);
        setLoading(false);
        return;
      }

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
        student_id: studentId,
        message: messageToSend,
        topic_id: topicId,
        subtopic_id: subtopicId,
        nested_subtopic_id: nestedSubtopicId,
        history: updatedChat,
        objectives
      });

      reply = res.data.reply;
      const progressFlags = res.data.progress || [];

      console.log("🎯 Progress flags received from backend:", progressFlags);

      setChat(prev => [...prev, { role: 'assistant', content: reply }]);

      if (Array.isArray(progressFlags)) {
        const newScore = calculateGrade(progressFlags);

        const updatedEvidence = { ...objectiveEvidence };
        progressFlags.forEach((flag, i) => {
          if (flag === true) updatedEvidence[i] = (updatedEvidence[i] || 0) + 1;
        });
        setObjectiveEvidence(updatedEvidence);

        const newProgress = progressFlags.map((flag, i) => {
          const current = objectiveProgress[i];
          if (current === true) return true;
          if (flag === true) return true;
          if (flag === 'progress' || current === 'progress') return 'progress';
          return false;
        });

        const finalAIScore = Math.max(aiScore ?? 0, newScore);

        if (typeof onProgressUpdate === 'function') onProgressUpdate(newProgress);
        if (typeof onScoreUpdate === 'function') onScoreUpdate(finalAIScore);

        setAiScore(finalAIScore);
        persistProgress(newProgress, quizScore || 0, finalAIScore, "ai");

        if (progressFlags.length > 0 && progressFlags.every(p => p === true) && !completionMessageSent) {
          setChat(prev => [...prev, {
            role: 'assistant',
            content: "✅ Awesome work! You’ve completed all objectives. Try the quiz or explore another topic!"
          }]);
          setCompletionMessageSent(true);
        }
      }
    } catch (err) {
      console.error("💥 Chat error:", err);
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
    if (typeof onScoreUpdate === 'function') onScoreUpdate(best);
  };

  return (
    <div className="relative bg-gray-50 rounded shadow">
      <div className="bg-gray-200 px-4 py-3 shadow-sm text-sm text-gray-800 w-full">
        <p>🎓 Welcome! I'm here to help you learn <strong>{formattedTitle}</strong>.</p>
        <p>Ask anything or take the quiz when ready!</p>
      </div>

      <div className="px-4 py-4 space-y-2">
        {chat.map((msg, idx) => (
          <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded max-w-full ${msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">Thinking…</div>}
      </div>

      <div className="fixed bottom-0 right-0 w-1/2 bg-white border-t p-4 flex gap-2 z-50">
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

      {QuizModal && (
        <QuizModal
          isOpen={quizOpen}
          onClose={() => setQuizOpen(false)}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default LearningCopilot;
