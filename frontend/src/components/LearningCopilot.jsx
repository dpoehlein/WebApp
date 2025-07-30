import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import welcomeMessages from "../data/ai/welcomeMessages";

const inferIntent = (message) => {
  const text = message.toLowerCase();

  const practiceKeywords = [
    "practice",
    "problem",
    "quiz",
    "test",
    "question",
    "exercise",
    "challenge",
  ];
  const explainKeywords = [
    "explain",
    "why",
    "how",
    "what is",
    "help me",
    "i don't get",
    "clarify",
    "teach",
  ];
  const reviewKeywords = [
    "review",
    "recap",
    "go over",
    "summary",
    "revise",
    "look back",
    "refresh",
  ];

  const matchesKeyword = (keywords) => keywords.some((kw) => text.includes(kw));

  if (matchesKeyword(practiceKeywords)) return "practice";
  if (matchesKeyword(explainKeywords)) return "explain";
  if (matchesKeyword(reviewKeywords)) return "review";

  return "default";
};

const LearningCopilot = forwardRef(
  (
    {
      topicId = "general",
      subtopicId = "number_systems",
      nestedSubtopicId = "binary",
      objectives = [],
      objectiveProgress = [],
      onProgressUpdate,
      onScoreUpdate,
      QuizModal,
    },
    ref
  ) => {
    const studentId = localStorage.getItem("student_id");

    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [objectiveEvidence, setObjectiveEvidence] = useState({});
    const [aiScore, setAiScore] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizOpen, setQuizOpen] = useState(false);
    const chatContainerRef = useRef(null);
    const lastSaveRef = useRef({});
    const [firstPromptSent, setFirstPromptSent] = useState(false);
    const [completionMessageSent, setCompletionMessageSent] = useState(false);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [mergedProgress, setMergedProgress] = useState([]);

    // 👇 Expose the startPracticeSession method to parent via ref
    useImperativeHandle(ref, () => ({
      startPracticeSession: async () => {
        console.log("🚀 Starting Practice Session");

        // Find the first objective not yet marked "completed"
        const unmastered = objectives
          .map((obj, i) => ({
            text: obj,
            status: mergedProgress[i],
          }))
          .filter((item) => item.status !== true);

        if (unmastered.length > 0) {
          const firstGap = unmastered[0];
          const reply = `Let's strengthen your understanding of this: **${firstGap.text}**.`;

          setChat((prev) => [...prev, { role: "assistant", content: reply }]);

          try {
            const genRes = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/generate-practice-problem`,
              {
                objective: firstGap.text,
              }
            );

            const followUp = genRes.data.problem;

            setChat((prev) => [
              ...prev,
              { role: "assistant", content: followUp },
            ]);
            setFirstPromptSent(true);
          } catch (err) {
            console.error("Practice problem error:", err);
            setChat((prev) => [
              ...prev,
              { role: "assistant", content: "⚠️ Failed to load practice problem." },
            ]);
          }
        } else {
          setChat((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "✅ You've completed all objectives. Want to review or retake the quiz for a higher score?",
            },
          ]);
        }
      },
    }));

    const formattedTitle = nestedSubtopicId
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const welcomeMessageFn = welcomeMessages[nestedSubtopicId];
    const welcomeMessage = welcomeMessageFn
      ? typeof welcomeMessageFn === "function"
        ? welcomeMessageFn(formattedTitle)
        : welcomeMessageFn
      : welcomeMessages["general"](formattedTitle);

    useEffect(() => {
      async function fetchSavedProgress() {
        if (!studentId || !topicId || !subtopicId || !nestedSubtopicId) return;

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/get-progress`,
            {
              params: {
                student_id: studentId,
                topic_id: topicId,
                subtopic_id: subtopicId,
                nested_subtopic_id: nestedSubtopicId,
              },
            }
          );

          const {
            objective_progress = [],
            ai_score = 0,
            quiz_score = 0,
          } = res.data || {};

          if (Array.isArray(objective_progress)) {
            if (typeof onProgressUpdate === "function") {
              onProgressUpdate([...objective_progress]);
            }

            if (typeof onScoreUpdate === "function") {
              onScoreUpdate(ai_score);
            }

            setAiScore(ai_score);
            setQuizScore(quiz_score);
            setMergedProgress([...objective_progress]);
          }

          setProgressLoaded(true);
        } catch (error) {
          console.error("Failed to load saved progress", error);
          setProgressLoaded(true);
        }
      }

      fetchSavedProgress();
    }, [
      topicId,
      subtopicId,
      nestedSubtopicId,
      onProgressUpdate,
      onScoreUpdate,
    ]);

    // Scroll to bottom when chat updates
    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [chat, loading]);

    // Compute topic grade from objective flags
    const calculateGrade = (progressFlags) => {
      const total = progressFlags.length;
      const score = progressFlags.reduce(
        (acc, p) => acc + (p === true ? 1 : p === "progress" ? 0.5 : 0),
        0
      );
      return total > 0 ? Math.round((score / total) * 100) : 0;
    };

    // Save AI or Quiz progress to backend
    const persistProgress = async (flags, quiz, ai, source = "ai") => {
      const payload = {
        student_id: studentId,
        topic_id: topicId,
        subtopic_id: subtopicId,
        nested_subtopic_id: nestedSubtopicId,
        ai_objective_progress: source === "ai" ? flags : undefined,
        quiz_objective_progress: source === "quiz" ? flags : undefined,
        ai_score: source === "ai" ? ai : undefined,
        quiz_score: source === "quiz" ? quiz : undefined,
      };

      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/save-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    };

    // Core message handler
    const sendMessage = async (customMessage = null) => {
      if (!progressLoaded) return;

      const messageToSend = customMessage || input;
      if (!messageToSend.trim()) return;

      const userMessage = { role: "user", content: messageToSend };
      const updatedChat = [...chat, userMessage];
      setChat(updatedChat);
      setInput("");
      setLoading(true);

      if (!firstPromptSent) setCompletionMessageSent(false);

      try {
        let reply = "";

        // First-time prompt logic
        if (!firstPromptSent) {
          const intent = inferIntent(messageToSend);
          const unmastered = objectives
            .map((obj, i) => ({ text: obj, status: mergedProgress[i], index: i }))
            .filter((item) => item.status !== true);

          if (unmastered.length > 0) {
            const firstGap = unmastered[0];

            switch (intent) {
              case "practice":
                reply = `Let's strengthen your understanding of this: **${firstGap.text}**.`;
                const genRes = await axios.post(
                  `${import.meta.env.VITE_BACKEND_URL}/generate-practice-problem`,
                  { objective: firstGap.text }
                );
                reply += `\n\n${genRes.data.problem}`;
                break;
              case "explain":
                reply = `Sure, let me explain this concept: **${firstGap.text}**.`;
                break;
              case "review":
                reply = `No problem! Let's review **${firstGap.text}** together.`;
                break;
              default:
                reply = `Let's strengthen your understanding of this: **${firstGap.text}**. Can you explain it or would you like a practice problem?`;
            }
          } else {
            reply = `✅ You've completed all objectives. Want to review or retake the quiz for a higher score?`;
          }

          setChat((prev) => [...prev, { role: "assistant", content: reply }]);
          setFirstPromptSent(true);
          setLoading(false);
          return;
        }

        // Send full message to backend
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
          student_id: studentId,
          message: messageToSend,
          topic_id: topicId,
          subtopic_id: subtopicId,
          nested_subtopic_id: nestedSubtopicId,
          history: updatedChat,
          objectives,
        });

        const {
          reply,
          progress = [],
          ai_score = 0,
          ready_prompt,
        } = res.data;

        setChat((prev) => [...prev, { role: "assistant", content: reply }]);

        // ✅ Update Learning Objectives
        if (Array.isArray(progress)) {
          const newProgress = progress.map((flag, i) => {
            const current = mergedProgress[i]; // Compare to mergedProgress
            if (current === true || flag === true) return true;
            if (flag === "progress" || current === "progress") return "progress";
            return false;
          });

          const changed =
            JSON.stringify(newProgress) !== JSON.stringify(mergedProgress);

          if (changed) {
            setMergedProgress(newProgress);
            if (typeof onProgressUpdate === "function") {
              onProgressUpdate(newProgress); // Notify parent
            }
            persistProgress(newProgress, quizScore, ai_score, "ai");
          }
        }

        // ✅ Update AI Score
        if (typeof onScoreUpdate === "function") {
          onScoreUpdate(ai_score, "ai");
        }
        setAiScore(ai_score);

        // ✅ Final encouragement message
        if (ready_prompt) {
          setChat((prev) => [...prev, { role: "assistant", content: ready_prompt }]);
        }

      } catch (err) {
        console.error("Chat error:", err);
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Sorry, something went wrong.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const handleQuizComplete = ({ score }) => {
      setQuizScore(score);
      const best = aiScore !== null ? Math.max(aiScore, score) : score;
      if (typeof onScoreUpdate === "function") onScoreUpdate(score, "quiz");
      persistProgress(mergedProgress, score, aiScore ?? 0, "quiz");
    };

    return (
      <div className="flex flex-col h-full bg-gray-50 rounded shadow">
        {/* Welcome message */}
        <div className="bg-gray-200 px-4 py-3 shadow-sm text-sm text-gray-800 w-full">
          <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
        </div>

        {/* Chat + Input + Button in fixed layout */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Chat Area */}
          <div
            className="flex-1 px-4 py-4 space-y-2 overflow-y-auto"
            ref={chatContainerRef}
          >
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded max-w-full ${
                    msg.role === "user" ? "bg-blue-200" : "bg-gray-200"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-center text-gray-500">Thinking…</div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t p-4 flex gap-2 bg-white shrink-0">
            <input
              type="text"
              className="flex-grow p-2 border rounded"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

        {/* Quiz Modal */}
        {QuizModal && (
          <QuizModal
            isOpen={quizOpen}
            onClose={() => setQuizOpen(false)}
            onQuizComplete={handleQuizComplete}
          />
        )}
      </div>
    );
  }
);

export default LearningCopilot;
