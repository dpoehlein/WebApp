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
import practicePriorities from "../data/ai/practice_priority";

// 🔍 Determine user intent based on keywords
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
    const priorityOrder =
      practicePriorities?.[topicId]?.[subtopicId]?.[nestedSubtopicId] || [];

    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizOpen, setQuizOpen] = useState(false);
    const [firstPromptSent, setFirstPromptSent] = useState(false);
    const [mergedProgress, setMergedProgress] = useState([]);
    const [practiceObjectiveIndex, setPracticeObjectiveIndex] = useState(null);
    const [practiceLevel, setPracticeLevel] = useState({ binary: "4bit" });
    const chatContainerRef = useRef(null);

    useImperativeHandle(ref, () => ({
      startPracticeSession: async () => {
        const unmastered = objectives
          .map((obj, i) => ({ text: obj, status: mergedProgress[i] }))
          .filter((item) => item.status !== true);
        if (unmastered.length === 0) {
          setChat((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "✅ You've completed all objectives.",
            },
          ]);
          return;
        }
        const firstGap = unmastered[0];
        setPracticeObjectiveIndex(objectives.indexOf(firstGap.text));
        const reply = `Let's work on: **${firstGap.text}**.`;
        setChat((prev) => [...prev, { role: "assistant", content: reply }]);
        let followUp = "";
        if (firstGap.text.includes("binary")) {
          const decimal =
            practiceLevel.binary === "4bit"
              ? Math.floor(Math.random() * 16)
              : Math.floor(Math.random() * 240) + 16;
          followUp = `Convert the decimal number ${decimal} to its ${practiceLevel.binary} binary equivalent.`;
          if (practiceLevel.binary === "4bit")
            setPracticeLevel((prev) => ({ ...prev, binary: "8bit" }));
        } else {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/generate-practice-problem`,
            { objective: firstGap.text }
          );
          followUp = res.data.problem;
        }
        setChat((prev) => [...prev, { role: "assistant", content: followUp }]);
        setFirstPromptSent(true);
      },
    }));

    useEffect(() => {
      setFirstPromptSent(false);
      setPracticeObjectiveIndex(null);
      setPracticeLevel({ binary: "4bit" });
    }, [nestedSubtopicId]);

    useEffect(() => {
      const fetchProgress = async () => {
        if (!studentId) return;
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
          const { objective_progress = [], quiz_score = 0 } = res.data;
          setMergedProgress([...objective_progress]);
          if (onProgressUpdate) onProgressUpdate([...objective_progress]);
          if (onScoreUpdate) onScoreUpdate(quiz_score);
          setQuizScore(quiz_score);
        } catch (err) {
          console.error("Failed to load progress", err);
        }
      };
      fetchProgress();
    }, [topicId, subtopicId, nestedSubtopicId]);

    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, [chat, loading]);

    const sendMessage = async () => {
      if (!input.trim()) return;
      const messageToSend = input;
      setInput("");
      const updatedChat = [...chat, { role: "user", content: messageToSend }];
      setChat(updatedChat);
      setLoading(true);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/chat`,
          {
            student_id: studentId,
            message: messageToSend,
            topic_id: topicId,
            subtopic_id: subtopicId,
            nested_subtopic_id: nestedSubtopicId,
            history: updatedChat,
            objectives,
          }
        );

        const { reply, progress = [], ready_prompt } = res.data;
        setChat((prev) => [...prev, { role: "assistant", content: reply }]);

        if (Array.isArray(progress)) {
          const newProgress = progress.map((flag, i) => {
            const current = mergedProgress[i];
            if (current === true || flag === true) return true;
            if (flag === "progress" || current === "progress")
              return "progress";
            return false;
          });
          const changed =
            JSON.stringify(newProgress) !== JSON.stringify(mergedProgress);
          if (changed) {
            setMergedProgress(newProgress);
            if (onProgressUpdate) onProgressUpdate(newProgress);
            const grade = Math.round(
              (newProgress.filter((f) => f === true).length /
                newProgress.length) *
                100
            );
            setChat((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `✅ You've made progress! Topic Grade: **${grade}%**`,
              },
            ]);
          }
        }
        if (ready_prompt)
          setChat((prev) => [
            ...prev,
            { role: "assistant", content: ready_prompt },
          ]);
      } catch (err) {
        console.error("Chat error", err);
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Error occurred." },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const handleQuizComplete = ({ score }) => {
      setQuizScore(score);
      if (onScoreUpdate) onScoreUpdate(score);
    };

    const welcome =
      welcomeMessages[nestedSubtopicId] || welcomeMessages.general;
    const formattedTitle = nestedSubtopicId
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <div className="flex flex-col h-full bg-gray-50 rounded shadow">
        <div className="bg-gray-200 px-4 py-3 shadow-sm text-sm text-gray-800 w-full">
          <ReactMarkdown>{welcome(formattedTitle)}</ReactMarkdown>
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
              onClick={sendMessage}
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
