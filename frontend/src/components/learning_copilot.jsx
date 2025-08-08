import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import welcomeMessages from "../data/ai/welcome_messages";
import nestedSubtopicTitles from "../utils/nested_subtopic_titles";

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
      topic_id,
      subtopic_id,
      nested_subtopic_id,
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
    const [quizScore, setQuizScore] = useState(0);
    const [quizOpen, setQuizOpen] = useState(false);
    const chatContainerRef = useRef(null);
    const lastSaveRef = useRef({});
    const [firstPromptSent, setFirstPromptSent] = useState(false);
    const [completionMessageSent, setCompletionMessageSent] = useState(false);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [mergedProgress, setMergedProgress] = useState([]);
    const [progressCounts, setProgressCounts] = useState({});

    const updateProgressWithCounts = (evidenceMap) => {
      const updatedCounts = { ...progressCounts };
      const newProgress = [...mergedProgress];

      objectives.forEach((obj, i) => {
        const evidence = evidenceMap[i];
        if (evidence && evidence.correct) {
          updatedCounts[i] = (updatedCounts[i] || 0) + 1;

          if (updatedCounts[i] >= 2) {
            newProgress[i] = true;
          } else {
            newProgress[i] = "progress";
          }
        }
      });

      setProgressCounts(updatedCounts);
      return newProgress;
    };

    useImperativeHandle(ref, () => ({
      startPracticeSession: async () => {
        console.log("🚀 Starting Practice Session");
        const unmastered = objectives
          .map((obj, i) => ({
            text: obj,
            status: mergedProgress[i],
          }))
          .filter((item) => item.status !== true);

        if (unmastered.length > 0) {
          const firstGap = unmastered[0];
          const introReply = `Let's strengthen your understanding of this: **${firstGap.text}**.`;
          setChat((prev) => [
            ...prev,
            { role: "assistant", content: introReply },
          ]);
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
              {
                role: "assistant",
                content: "⚠️ Failed to load practice problem.",
              },
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

    const formattedTitle =
      nestedSubtopicTitles[nested_subtopic_id] || "this topic";
    const welcomeMessageGenerator =
      welcomeMessages[nested_subtopic_id] || welcomeMessages.general;
    const welcomeMessage = welcomeMessageGenerator(formattedTitle);

    console.log("🧪 nested_subtopic_id:", nested_subtopic_id);
    console.log("🧪 nested_subtopic_titles:", nestedSubtopicTitles);
    console.log("🧪 formatted_title:", formattedTitle);
    console.log("🧪 welcome_message:", welcomeMessage);

    useEffect(() => {
      async function fetchSavedProgress() {
        if (!studentId || !topic_id || !subtopic_id || !nested_subtopic_id)
          return;
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/get-progress`,
            {
              params: {
                student_id: studentId,
                topic_id: topic_id,
                subtopic_id: subtopic_id,
                nested_subtopic_id: nested_subtopic_id,
              },
            }
          );
          const { objective_progress = [], quiz_score = 0 } = res.data || {};

          if (Array.isArray(objective_progress)) {
            onProgressUpdate?.([...objective_progress]);
            onScoreUpdate?.(quiz_score, "quiz");
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
      topic_id,
      subtopic_id,
      nested_subtopic_id,
      onProgressUpdate,
      onScoreUpdate,
    ]);

    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, [chat, loading]);

    const calculateGrade = (flags) => {
      const total = flags.length;
      const score = flags.reduce(
        (acc, p) => acc + (p === true ? 1 : p === "progress" ? 0.5 : 0),
        0
      );
      return total > 0 ? Math.round((score / total) * 100) : 0;
    };

    const persistProgress = async (flags, quiz, source = "ai") => {
      // ✅ Guard clause: Prevent saving junk progress
      if (
        !studentId ||
        !topic_id ||
        !subtopic_id ||
        !nested_subtopic_id ||
        topic_id === "unknown" ||
        subtopic_id === "unknown" ||
        nested_subtopic_id === "unknown"
      ) {
        console.warn(
          "Skipping progress save: Incomplete or unknown identifiers"
        );
        return;
      }

      const payload = {
        student_id: studentId,
        topic_id,
        subtopic_id,
        nested_subtopic_id,
        ai_objective_progress: source === "ai" ? flags : undefined,
        quiz_objective_progress: source === "quiz" ? flags : undefined,
        quiz_score: source === "quiz" ? quiz : undefined,
      };

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/save-progress`,
          payload
        );
      } catch (err) {
        console.error("❌ Error saving progress:", err);
      }
    };

    const generateProgressSnapshot = () => {
      const emojiMap = {
        true: "🟢", // Completed
        false: "🔵", // Needs Work
        progress: "🟡", // Making Progress
      };

      const snapshotLines = (mergedProgress || []).map((status, i) => {
        const label = objectives[i] || `Objective ${i + 1}`;
        const icon = emojiMap[status];
        return `${icon} ${label}`;
      });

      return `📊 Here's your current progress so far:\n\n${snapshotLines.join(
        "\n"
      )}`;
    };

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

      // ✅ Inject Progress Snapshot (before Copilot reply)
      const showSnapshot =
        chat.length === 0 ||
        messageToSend.toLowerCase().includes("progress") ||
        inferIntent(messageToSend) === "practice";

      if (showSnapshot) {
        const snapshot = generateProgressSnapshot();
        setChat((prev) => [...prev, { role: "assistant", content: snapshot }]);
      }

      try {
        let assistantReply = "";

        // ✅ First-time prompt logic (before /chat call)
        if (!firstPromptSent) {
          const intent = inferIntent(messageToSend);
          const unmastered = objectives
            .map((obj, i) => ({
              text: obj,
              status: mergedProgress[i],
              index: i,
            }))
            .filter((item) => item.status !== true);

          if (unmastered.length > 0) {
            const firstGap = unmastered[0];
            switch (intent) {
              case "practice":
                assistantReply = `Let's strengthen your understanding of this: **${firstGap.text}**.`;
                const genRes = await axios.post(
                  `${
                    import.meta.env.VITE_BACKEND_URL
                  }/generate-practice-problem`,
                  { objective: firstGap.text }
                );
                assistantReply += `\n\n${genRes.data.problem}`;
                break;
              case "explain":
                assistantReply = `Sure, let me explain this concept: **${firstGap.text}**.`;
                break;
              case "review":
                assistantReply = `No problem! Let's review **${firstGap.text}** together.`;
                break;
              default:
                assistantReply = `Let's strengthen your understanding of this: **${firstGap.text}**. Can you explain it or would you like a practice problem?`;
            }
          } else {
            assistantReply = `✅ You've completed all objectives. Want to review or retake the quiz for a higher score?`;
          }

          setChat((prev) => [
            ...prev,
            { role: "assistant", content: assistantReply },
          ]);
          setFirstPromptSent(true);
        }

        // 🔁 Always send message to backend regardless of firstPromptSent
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/chat`,
          {
            student_id: studentId,
            message: messageToSend,
            topic_id,
            subtopic_id,
            nested_subtopic_id,
            history: updatedChat,
            objectives,
          }
        );

        const { reply: backendReply, progress = [], ready_prompt } = res.data;

        setChat((prev) => [
          ...prev,
          { role: "assistant", content: backendReply },
        ]);

        if (Array.isArray(progress)) {
          const newEvidence = {};
          progress.forEach((flag, i) => {
            newEvidence[i] = { correct: flag === true };
          });

          const newProgress = updateProgressWithCounts(newEvidence);

          if (JSON.stringify(newProgress) !== JSON.stringify(mergedProgress)) {
            setMergedProgress(newProgress);
            onProgressUpdate?.(newProgress);
            persistProgress(newProgress, quizScore, "ai");
          }
        }

        // ⛔️ This block is outside the above `if (Array.isArray(progress))`
        if (JSON.stringify(newProgress) !== JSON.stringify(mergedProgress)) {
          setMergedProgress(newProgress);
          onProgressUpdate?.(newProgress);
          persistProgress(newProgress, quizScore, "ai");
        }

        if (ready_prompt) {
          setChat((prev) => [
            ...prev,
            { role: "assistant", content: ready_prompt },
          ]);
        }
      } catch (err) {
        console.error("Chat error:", err);
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Sorry, something went wrong." },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const handleQuizComplete = ({ score }) => {
      setQuizScore(score);
      onScoreUpdate?.(score, "quiz");
      persistProgress(mergedProgress, score, "quiz");
    };

    return (
      <div className="flex flex-col h-full bg-gray-50 rounded shadow">
        <div className="bg-gray-200 px-4 py-3 shadow-sm text-sm text-gray-800 w-full">
          <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
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
