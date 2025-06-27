import React, { useMemo, useEffect, useState, Suspense, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ContentContainer from "../../components/ContentContainer";
import LearningCopilot from "../../components/LearningCopilot.jsx";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import Banner from "../../components/Banner";
import LearningObjectives from "../../components/LearningObjectives"; // ✅ the UI component
import learningObjectives from "../../data/ai/learningObjectives";  // ✅ the data

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

const NestedSubtopicPage = ({ topicId: propTopicId, subtopicId: propSubtopicId, nestedSubtopicId: propNestedSubtopicId }) => {
  const routeParams = useParams();
  const topicId = propTopicId || routeParams.topicId;
  const subtopicId = propSubtopicId || routeParams.subtopicId;
  const nestedSubtopicId = propNestedSubtopicId || routeParams.nestedSubtopicId;
  const hasLoadedRef = useRef(false);
  const hasFetchedProgressRef = useRef(false);
  const [subtopicData, setSubtopicData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  useEffect(() => {
    console.log("📘 Updated objectiveProgress in NestedSubtopicPage:", objectiveProgress);
  }, [objectiveProgress]);
  
  const [quizScore, setQuizScore] = useState(0);
  const [aiScore, setAIScore] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const QuizModal = quizModals[nestedSubtopicId] || null;
  const WalkthroughComponent = walkthroughComponents[nestedSubtopicId] || null;

  const objectives = useMemo(() => {
    return learningObjectives[topicId]?.[subtopicId]?.[nestedSubtopicId] || [];
  }, [topicId, subtopicId, nestedSubtopicId]);

  const mergeFlags = (prev, next) => {
    const maxLength = Math.max(prev.length, next.length);
    return Array.from({ length: maxLength }).map((_, idx) => {
      const oldVal = prev[idx];
      const newVal = next[idx];
      if (newVal === true || oldVal === true) return true;
      if (newVal === 'partial' || oldVal === 'partial') return 'partial';
      return false;
    });
  };
  
  const persistProgress = async (flags, quiz, ai, source = "ai") => {
    const studentId = localStorage.getItem("student_id");
    if (!studentId) return;
    try {
      await fetch('http://localhost:8000/save-progress', {
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
          quiz_score: source === "quiz" ? quiz : undefined
        })
      });      
    } catch (err) {
      console.error("Failed to auto-persist progress:", err);
    }
  };

  useEffect(() => {
    if (hasFetchedProgressRef.current || !objectives.length) {
      console.log("⏭ Skipping progress fetch. Already fetched or objectives not ready.");
      return;
    }

    console.log("🚀 FETCHING PROGRESS: triggered once only");
    hasFetchedProgressRef.current = true;

    const studentId = localStorage.getItem("student_id");
    if (!studentId) return;

    const fetchSavedProgress = async () => {
      try {
        const res = await fetch(`http://localhost:8000/get-progress?student_id=${studentId}&topic_id=${topicId}&subtopic_id=${subtopicId}&nested_subtopic_id=${nestedSubtopicId}`);
        const data = await res.json();

        const defaultProgress = objectives.map(() => false);
        const loaded = Array.isArray(data.objective_progress) ? data.objective_progress : defaultProgress;

        setQuizScore(data.quiz_score || 0);
        setAIScore(data.ai_score || 0);
        setTopicGrade(data.topic_grade || 0);

        const merged = loaded; // ✅ Trust backend merged flags

        const last = localStorage.getItem("last_saved_progress");
        const hasChanged = JSON.stringify(merged) !== last;

        if (hasChanged) {
          setObjectiveProgress(merged);
          persistProgress(merged, data.quiz_score || 0, data.ai_score || 0, "ai");
          localStorage.setItem("last_saved_progress", JSON.stringify(merged));
        } else {
          setObjectiveProgress(merged); // ✅ still update UI if frontend state was stale
        }

        hasLoadedRef.current = true;
      } catch (err) {
        console.error("❌ Failed to load saved progress:", err);
        setObjectiveProgress(objectives.map(() => false));
      }
    };

    fetchSavedProgress();
  }, [objectives.length]);

  useEffect(() => {
    Promise.all([
      fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/subtopic.json`).then(res => res.json()),
      fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/practice.json`).then(res => res.json()),
      fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/videos.json`).then(res => res.json())
    ])
      .then(([subtopicRes, practiceRes, videoRes]) => {
        setSubtopicData(subtopicRes);
        setPracticeData(practiceRes);
        setVideoData(videoRes);
      })
      .catch(err => {
        console.error("❌ Failed to load nested subtopic JSON files", err);
      });
  }, [topicId, subtopicId, nestedSubtopicId]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const current = JSON.stringify(objectiveProgress);
    const last = localStorage.getItem("last_saved_progress");
    if (current !== last) {
      localStorage.setItem("last_saved_progress", current);
      const timeout = setTimeout(() => {
        if (objectiveProgress.length === objectives.length) {
          persistProgress(objectiveProgress, quizScore, aiScore, "ai");
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [objectiveProgress, quizScore, aiScore]);

  const handleQuizCompletion = ({ score, objectiveKeys, objective_progress }) => {
    setQuizScore(score);

    console.log("📩 handleQuizCompletion:", { score, objectiveKeys, objective_progress });

    if (objective_progress?.length === objectives.length) {
      setObjectiveProgress(prev => {
        const merged = mergeFlags(prev, objective_progress);
        persistProgress(merged, score, aiScore, "quiz"); // 🔥 Manual save
        return merged;
      });
    } else if (objectiveKeys) {
      setObjectiveProgress(prev => {
        const updated = [...prev];
        objectiveKeys.forEach(key => {
          const index = objectives.findIndex(obj => obj.key === key);
          if (index !== -1) updated[index] = true;
        });
        persistProgress(updated, score, aiScore, "quiz"); // 🔥 Manual save
        return updated;
      });
    } else {
      persistProgress(objectiveProgress, score, aiScore, "quiz"); // fallback
    }
  };
  
  const completed = objectiveProgress.filter(p => p === true).length;
  const total = objectives.length;
  const [topicGrade, setTopicGrade] = useState(0);

  if (!subtopicData) return <div className="p-8 text-gray-600">Loading...</div>;

  return (
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
                    <strong>📊 Module Progress Tracking:</strong> As you use the Learning Copilot or complete the quiz, your progress toward completing the learning objectives will update.
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
            {WalkthroughComponent ? (
              <Suspense fallback={<div>Loading visual...</div>}>
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">How It Works</h2>
                  <WalkthroughComponent />
                </div>
              </Suspense>
            ) : practiceData?.problems?.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Practice Problems</h2>
                <ul className="list-decimal list-inside space-y-2 text-gray-700">
                  {practiceData.problems.map((prob, idx) => (
                    <li key={idx}>
                      <p className="font-medium">{prob.question}</p>
                      <p className="text-sm text-gray-500">Answer: {prob.answer}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {videoData?.videos && (
              <div className="bg-white rounded shadow p-6 border mt-6">
                <h2 className="text-lg font-semibold mb-4">📺 Recommended Videos</h2>
                <ul className="space-y-4">
                  {videoData.videos.map((vid, idx) => (
                    <li key={idx}>
                      <p className="text-blue-700 font-semibold">{vid.title}</p>
                      <p className="text-gray-600 text-sm mb-1">{vid.description}</p>
                      <a href={vid.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">Watch Video</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ContentContainer>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col h-[calc(100vh-160px)] overflow-hidden space-y-4">
          <div className="bg-white p-4 rounded shadow-md border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">
                AI Score: <span className="text-green-600 text-xl font-bold">{aiScore}%</span>
              </p>
              <p className="text-lg font-semibold">
                Quiz Score: <span className="text-purple-600 text-xl font-bold">{quizScore}%</span>
              </p>
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
          <LearningCopilot
            topicId={topicId}
            subtopicId={subtopicId}
            nestedSubtopicId={nestedSubtopicId}
            objectives={objectives}
            objectiveProgress={objectiveProgress}
            onProgressUpdate={(progressFlags) => setObjectiveProgress(progressFlags)}
            onScoreUpdate={(score) => setAIScore(score)}
            QuizModal={QuizModal}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NestedSubtopicPage;
