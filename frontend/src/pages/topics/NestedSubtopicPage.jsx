import React, {
  useMemo, useEffect, useState, Suspense, useRef, useCallback
} from 'react';
import { useParams } from 'react-router-dom';
import ContentContainer from "../../components/ContentContainer";
import LearningCopilot from "../../components/LearningCopilot.jsx";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import Banner from "../../components/Banner";
import LearningObjectives from "../../components/LearningObjectives";
import learningObjectives from "../../data/ai/learningObjectives";

const walkthroughComponents = {
  binary: React.lazy(() => import('../../components/digital_electronics/number_systems/BinaryDemo')),
  octal: React.lazy(() => import('../../components/digital_electronics/number_systems/OctalDemo')),
  hexadecimal: React.lazy(() => import('../../components/digital_electronics/number_systems/HexadecimalDemo')),
  bcd: React.lazy(() => import('../../components/digital_electronics/number_systems/BcdDemo')),
  gray_code: React.lazy(() => import('../../components/digital_electronics/number_systems/GrayCodeDemo')),
};

const quizModals = {
  binary: React.lazy(() => import('../../components/digital_electronics/number_systems/BinaryQuizModal.jsx')),
  octal: React.lazy(() => import('../../components/digital_electronics/number_systems/OctalQuizModal.jsx')),
  hexadecimal: React.lazy(() => import('../../components/digital_electronics/number_systems/HexadecimalQuizModal.jsx')),
  bcd: React.lazy(() => import('../../components/digital_electronics/number_systems/BcdQuizModal.jsx')),
  gray_code: React.lazy(() => import('../../components/digital_electronics/number_systems/GraycodeQuizModal.jsx')),
};

const NestedSubtopicPage = () => {
  const { topicId, subtopicId, nestedSubtopicId } = useParams();

  console.log("🧭 NestedSubtopicPage: Route Params", {
    topicId,
    subtopicId,
    nestedSubtopicId
  });

  if ([topicId, subtopicId, nestedSubtopicId].some(val => !val || val === "undefined")) {
    console.warn("⛔ Halting render: invalid route params", { topicId, subtopicId, nestedSubtopicId });
    return <div className="p-6 text-red-600 font-semibold">Invalid route parameters.</div>;
  }

  const [subtopicData, setSubtopicData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [aiScore, setAIScore] = useState(0);
  const [topicGrade, setTopicGrade] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const fetchedRef = useRef(false);

  const QuizModal = quizModals[nestedSubtopicId] || null;
  const WalkthroughComponent = walkthroughComponents[nestedSubtopicId] || null;

  const objectives = useMemo(() => {
    const loaded = learningObjectives[topicId]?.[subtopicId]?.[nestedSubtopicId] || [];
    console.log("🧠 Loaded learning objectives:", loaded);
    return loaded;
  }, [topicId, subtopicId, nestedSubtopicId]);

  const mergeFlags = (prev, next) => {
    const max = Math.max(prev.length, next.length);
    return Array.from({ length: max }, (_, i) => {
      if (next[i] === true || prev[i] === true) return true;
      if (next[i] === 'progress' || prev[i] === 'progress') return 'progress';
      return false;
    });
  };

  const persistProgress = useCallback(async (flags, quiz, ai, source = "ai") => {
    const studentId = localStorage.getItem("student_id");
    if (
      !studentId ||
      [topicId, subtopicId, nestedSubtopicId].some(val => !val || val === "undefined")
    ) {
      console.warn("⛔ Skipping persistProgress due to invalid params", {
        studentId, topicId, subtopicId, nestedSubtopicId
      });
      return;
    }

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
      console.log("💾 Progress persisted:", { flags, quiz, ai, source });
    } catch (err) {
      console.error("❌ Failed to persist progress:", err);
    }
  }, [topicId, subtopicId, nestedSubtopicId]);

  useEffect(() => {
    if (!objectives.length || fetchedRef.current) return;
    fetchedRef.current = true;

    const studentId = localStorage.getItem("student_id");
    if (!studentId || !topicId || !subtopicId || !nestedSubtopicId) return;

    const fetchSavedProgress = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/get-progress?student_id=${studentId}&topic=${topicId}&subtopic=${subtopicId}&nested_subtopic=${nestedSubtopicId}`;
        const res = await fetch(url);
        const data = await res.json();

        const quiz = data.quiz_score ?? 0;
        const ai = data.ai_score ?? 0;
        const flags = Array.isArray(data.objective_progress)
          ? data.objective_progress
          : objectives.map(() => false);

        setQuizScore(quiz);
        setAIScore(ai);
        setTopicGrade(Math.max(ai, quiz));
        setObjectiveProgress(flags);
      } catch (err) {
        console.error("❌ Failed to fetch progress:", err);
        setObjectiveProgress(objectives.map(() => false));
      }
    };

    fetchSavedProgress();
  }, [objectives, topicId, subtopicId, nestedSubtopicId]);

  useEffect(() => {
    Promise.all([
      fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/subtopic.json`).then(r => r.json()),
      fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/practice.json`).then(r => r.json()),
      fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/videos.json`).then(r => r.json()),
    ])
      .then(([subtopic, practice, videos]) => {
        setSubtopicData(subtopic);
        setPracticeData(practice);
        setVideoData(videos);
      })
      .catch(err => {
        console.error("❌ Failed to load nested subtopic content", err);
      });
  }, [topicId, subtopicId, nestedSubtopicId]);

  const handleQuizCompletion = ({ score, objectiveKeys, objective_progress }) => {
    setQuizScore(score);
    setTopicGrade(Math.max(score, aiScore));

    if (objective_progress?.length === objectives.length) {
      setObjectiveProgress(prev => {
        const merged = mergeFlags(prev, objective_progress);
        persistProgress(merged, score, aiScore, "quiz");
        return merged;
      });
    } else if (objectiveKeys) {
      setObjectiveProgress(prev => {
        const updated = [...prev];
        objectiveKeys.forEach(key => {
          const index = objectives.findIndex(obj => obj.key === key);
          if (index !== -1) updated[index] = true;
        });
        persistProgress(updated, score, aiScore, "quiz");
        return updated;
      });
    } else {
      persistProgress(objectiveProgress, score, aiScore, "quiz");
    }
  };

  if (!subtopicData) return <div className="p-8 text-gray-600">Loading...</div>;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Banner title={subtopicData.title} background={`/images/${topicId}/banner.jpg`} height="h-36" />
        <Breadcrumb paths={[
          { label: "Home", to: "/" },
          { label: topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), to: `/topics/${topicId}` },
          { label: subtopicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), to: `/topics/${topicId}/${subtopicId}` },
          { label: subtopicData.title }
        ]} />
        <main className="flex-1 w-full px-6 py-8 flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 overflow-y-auto pr-2">
            <ContentContainer className="max-w-none">
              <p className="text-gray-700 text-lg font-medium mb-4">{subtopicData.description}</p>
              {objectives.length > 0 && (
                <div className="mb-6">
                  <div className="mb-4 p-4 rounded bg-white border shadow">
                    <p className="text-md text-gray-800 font-medium mb-2">
                      <strong>📊 Module Progress Tracking:</strong> Your learning objective progress updates here as you work.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-800">Topic Grade: {topicGrade}%</div>
                      <div className="text-sm text-gray-600 space-x-4">
                        <span>🟢 Completed</span>
                        <span>🟡 Making Progress</span>
                        <span>🔵 Needs Work</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Learning Objectives</h2>
                  <LearningObjectives objectives={objectives} progress={objectiveProgress} />
                </div>
              )}
              {WalkthroughComponent && (
                <Suspense fallback={<div>Loading visual...</div>}>
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">How It Works</h2>
                    <WalkthroughComponent />
                  </div>
                </Suspense>
              )}
            </ContentContainer>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col h-[calc(100vh-160px)] overflow-hidden space-y-4">
            <div className="bg-white p-4 rounded shadow-md border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold">AI Score: <span className="text-green-600 text-xl font-bold">{aiScore}%</span></p>
                <p className="text-lg font-semibold">Quiz Score: <span className="text-purple-600 text-xl font-bold">{quizScore}%</span></p>
              </div>
              <button className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200" onClick={() => setIsQuizOpen(true)}>
                🧠 Take {subtopicData.title} Quiz
              </button>
            </div>

            {QuizModal && (
              <Suspense fallback={<div>Loading quiz...</div>}>
                <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onQuizComplete={handleQuizCompletion} />
              </Suspense>
            )}

            {[topicId, subtopicId, nestedSubtopicId].every(val => val && val !== "undefined") && (
              <LearningCopilot
                topicId={topicId}
                subtopicId={subtopicId}
                nestedSubtopicId={nestedSubtopicId}
                objectives={objectives}
                objectiveProgress={objectiveProgress}
                onProgressUpdate={(flags) => {
                  setObjectiveProgress(flags);
                  if (topicId && subtopicId && nestedSubtopicId !== "undefined") {
                    persistProgress(flags, quizScore, aiScore, "ai");
                  } else {
                    console.warn("🚫 Skipped persistProgress from onProgressUpdate due to bad route params");
                  }
                }}
                onScoreUpdate={(score) => {
                  setAIScore(score);
                  setTopicGrade(Math.max(score, quizScore));
                  if (topicId && subtopicId && nestedSubtopicId !== "undefined") {
                    persistProgress(objectiveProgress, quizScore, score, "ai");
                  } else {
                    console.warn("🚫 Skipped persistProgress from onScoreUpdate due to bad route params");
                  }
                }}
                QuizModal={QuizModal}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default NestedSubtopicPage;
