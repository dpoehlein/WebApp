import React, {
  useMemo,
  useEffect,
  useState,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import ContentContainer from "../../components/content_container";
import LearningCopilot from "../../components/learning_copilot";
import Breadcrumb from "../../components/breadcrumb";
import Footer from "../../components/footer";
import Banner from "../../components/banner";
import LearningObjectives from "../../components/learning_objectives";
import learningObjectives from "../../data/ai/learning_objectives";
import ErrorBoundary from "../../components/error_boundary";
import loadDynamicComponent from "../../utils/load_dynamic_component";

const NestedSubtopicPage = () => {
  const { topic_id, subtopic_id, nested_subtopic_id } = useParams();
  const [subtopicData, setSubtopicData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [topicGrade, setTopicGrade] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const fetchedRef = useRef(false);
  const lastSavedProgressRef = useRef([]);
  const lastSavedScoreRef = useRef({ quiz: 0 });
  const copilotRef = useRef(null);

  const QuizModal = useMemo(
    () =>
      loadDynamicComponent("quiz", topic_id, subtopic_id, nested_subtopic_id) ||
      null,
    [topic_id, subtopic_id, nested_subtopic_id]
  );

  const WalkthroughComponent = useMemo(
    () =>
      loadDynamicComponent(
        "walkthrough",
        topic_id,
        subtopic_id,
        nested_subtopic_id
      ) || null,
    [topic_id, subtopic_id, nested_subtopic_id]
  );

  const isValid = [topic_id, subtopic_id, nested_subtopic_id].every(
    (val) => val && val !== "undefined"
  );

  if (!isValid) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Invalid route parameters.
      </div>
    );
  }

  const objectives = useMemo(() => {
    return (
      learningObjectivesData?.[topic_id]?.[subtopic_id]?.[nested_subtopic_id] ||
      []
    );
  }, [topic_id, subtopic_id, nested_subtopic_id]);

  const mergeFlags = (prev, next) => {
    const max = Math.max(prev.length, next.length);
    return Array.from({ length: max }, (_, i) => {
      if (next[i] === true || prev[i] === true) return true;
      if (next[i] === "progress" || prev[i] === "progress") return "progress";
      return false;
    });
  };

  const persistProgress = useCallback(
    async (flags, quiz) => {
      const student_id = localStorage.getItem("student_id");
      if (!student_id || !isValid) return;

      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/save-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id,
            topic_id,
            subtopic_id,
            nested_subtopic_id,
            quiz_objective_progress: flags,
            quiz_score: quiz,
          }),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    },
    [topic_id, subtopic_id, nested_subtopic_id, isValid]
  );

  useEffect(() => {
    if (!objectives.length || !isValid || fetchedRef.current) return;

    const student_id = localStorage.getItem("student_id");
    if (!student_id) return;

    fetchedRef.current = true;

    const fetchProgress = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/get-progress?student_id=${student_id}&topic_id=${topic_id}&subtopic_id=${subtopic_id}&nested_subtopic_id=${nested_subtopic_id}`
        );
        const data = await res.json();

        const quiz = data.quiz_score ?? 0;
        const flags = Array.isArray(data.objective_progress)
          ? data.objective_progress
          : objectives.map(() => false);

        setQuizScore(quiz);
        setTopicGrade(Math.max(quiz));
        setObjectiveProgress(
          flags.length === objectives.length
            ? flags
            : objectives.map(() => false)
        );
        lastSavedProgressRef.current = [...flags];
        lastSavedScoreRef.current = { quiz };
      } catch (err) {
        setObjectiveProgress(objectives.map(() => false));
      }
    };

    fetchProgress();
  }, [objectives, isValid]);

  useEffect(() => {
    Promise.all([
      fetch(
        `/data/topics/${topic_id}/subtopics/${subtopic_id}/${nested_subtopic_id}/subtopic.json`
      ).then((r) => r.json()),
      fetch(
        `/data/topics/${topic_id}/subtopics/${subtopic_id}/${nested_subtopic_id}/practice.json`
      ).then((r) => r.json()),
      fetch(
        `/data/topics/${topic_id}/subtopics/${subtopic_id}/${nested_subtopic_id}/videos.json`
      ).then((r) => r.json()),
    ])
      .then(([subtopic, practice, videos]) => {
        setSubtopicData(subtopic);
        setPracticeData(practice);
        setVideoData(videos);
      })
      .catch((err) => {
        console.error("Failed to load subtopic content:", err);
      });
  }, [topic_id, subtopic_id, nested_subtopic_id]);

  const handleQuizCompletion = ({
    score,
    objectiveKeys,
    objective_progress,
  }) => {
    setQuizScore(score);
    setTopicGrade(Math.max(score));

    if (objective_progress?.length === objectives.length) {
      const merged = mergeFlags(objectiveProgress, objective_progress);
      setObjectiveProgress(merged);
      persistProgress(merged, score, "quiz");
    } else if (objectiveKeys) {
      const updated = [...objectiveProgress];
      objectiveKeys.forEach((key) => {
        const i = objectives.findIndex((obj) => obj.key === key);
        if (i !== -1) updated[i] = true;
      });
      setObjectiveProgress(updated);
      persistProgress(updated, score, "quiz");
    } else {
      persistProgress(objectiveProgress, score, "quiz");
    }
  };

  if (!subtopicData) {
    return <div className="p-8 text-gray-600">Loading...</div>;
  }

  const handleStartPractice = () => {
    if (copilotRef.current) {
      copilotRef.current.startPracticeSession();
    } else {
      console.warn("Copilot ref is not ready.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner
        title={subtopicData.title}
        background={`/images/${topic_id}/banner.jpg`}
        height="h-36"
      />

      <Breadcrumb
        paths={[
          { label: "Home", to: "/" },
          {
            label: topic_id
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            to: `/topics/${topic_id}`,
          },
          {
            label: subtopic_id
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            to: `/topics/${topic_id}/${subtopic_id}`,
          },
          { label: subtopicData.title },
        ]}
      />

      <main className="flex-1 w-full px-6 py-8 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 overflow-y-auto pr-2">
          <ContentContainer className="max-w-none">
            <p className="text-gray-700 text-lg font-medium mb-4">
              {subtopicData.description}
            </p>

            {objectives.length > 0 && (
              <div className="mb-6">
                <div className="mb-4 p-4 rounded bg-white border shadow">
                  <p className="text-md text-gray-800 font-medium mb-2">
                    <strong>📊 Module Progress Tracking:</strong> Your progress
                    on each learning objective is shown below.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-800">
                      Topic Grade: {topicGrade}%
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>🟢 Completed</span>
                      <span>🟡 Making Progress</span>
                      <span>🔵 Needs Work</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  Learning Objectives
                </h2>
                <LearningObjectivesPanel
                  objectives={objectives}
                  progress={objectiveProgress}
                />
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">How It Works</h2>
              {WalkthroughComponent ? (
                <Suspense fallback={<div>Loading walkthrough...</div>}>
                  <ErrorBoundary
                    fallback={<div>⚠️ Walkthrough not available yet.</div>}
                  >
                    <WalkthroughComponent />
                  </ErrorBoundary>
                </Suspense>
              ) : (
                <div className="text-gray-500 italic">
                  ⚠️ Walkthrough is not yet available for this module.
                </div>
              )}
            </div>
          </ContentContainer>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col max-h-[calc(100vh-180px)]">
          <div className="bg-white p-4 rounded shadow-md border flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">
                Quiz Score:{" "}
                <span className="text-purple-600 text-xl font-bold">
                  {quizScore}%
                </span>
              </p>
            </div>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                onClick={handleStartPractice}
              >
                🧠 Practice Problems
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                onClick={() => setIsQuizOpen(true)}
              >
                🧪 Take {subtopicData.title} Quiz
              </button>
            </div>
          </div>

          {QuizModal ? (
            <Suspense fallback={<div>Loading quiz...</div>}>
              <ErrorBoundary fallback={<div>⚠️ Quiz not available yet.</div>}>
                <QuizModal
                  isOpen={isQuizOpen}
                  onClose={() => setIsQuizOpen(false)}
                  onQuizComplete={handleQuizCompletion}
                />
              </ErrorBoundary>
            </Suspense>
          ) : (
            <div className="mt-4 text-sm text-gray-500 italic">
              ⚠️ No quiz has been created for this subtopic yet.
            </div>
          )}

          <LearningCopilot
            ref={copilotRef} // ✅ This enables external control like startPracticeSession()
            topic_id={topic_id}
            subtopic_id={subtopic_id}
            nested_subtopic_id={nested_subtopic_id}
            objectives={objectives}
            objectiveProgress={objectiveProgress}
            onProgressUpdate={(flags) => {
              const hasChanged = !flags.every(
                (val, i) => val === lastSavedProgressRef.current[i]
              );
              if (hasChanged) {
                setObjectiveProgress(flags);
                persistProgress(flags, quizScore, "quiz"); // ✅ unified as "quiz"
                lastSavedProgressRef.current = [...flags];
              }
            }}
            onScoreUpdate={(score) => {
              if (score !== lastSavedScoreRef.current.quiz) {
                setQuizScore(score);
                setTopicGrade(score); // ✅ No aiScore, so just use quiz score
                persistProgress(objectiveProgress, score, "quiz");
                lastSavedScoreRef.current.quiz = score;
              }
            }}
            QuizModal={QuizModal}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NestedSubtopicPage;
