// src/pages/topics/NestedSubtopicPage.jsx
import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';

import ContentContainer from "../../components/ContentContainer";
import AIChatAssistant from "../../components/AIChatAssistant";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import Banner from "../../components/Banner";

import learningObjectives from '../../data/ai/learningObjectives';

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

  const [subtopicData, setSubtopicData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [objectiveProgress, setObjectiveProgress] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [aiScore, setAIScore] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const QuizModal = quizModals[nestedSubtopicId] || null;
  const WalkthroughComponent = walkthroughComponents[nestedSubtopicId] || null;

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
      .catch((err) => console.error("Failed to load nested subtopic data:", err));
  }, [topicId, subtopicId, nestedSubtopicId]);

  const objectives = (learningObjectives[topicId]?.[subtopicId]?.[nestedSubtopicId]) || [];
  const topicName = topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const subtopicName = subtopicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const completed = objectiveProgress.filter(p => p === true).length;
  const total = objectives.length;
  const aiPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overallGrade = Math.max(aiPercent, quizScore || 0, aiScore || 0);

  const handleQuizCompletion = ({ score, objectiveKeys }) => {
    setQuizScore(score);
    setObjectiveProgress((prev) => {
      const updated = [...prev];
      objectiveKeys.forEach((key) => {
        const index = objectives.findIndex((obj) => obj.key === key);
        if (index !== -1) {
          updated[index] = true;
        }
      });
      return updated;
    });
  };

  if (!subtopicData) return <div className="p-8 text-gray-600">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner
        title={subtopicData.title}
        background={`/images/${topicId}/banner.jpg`}
        height="h-36"
      />

      <Breadcrumb
        paths={[
          { label: "Home", to: "/" },
          { label: topicName, to: `/topics/${topicId}` },
          { label: subtopicName, to: `/topics/${topicId}/${subtopicId}` },
          { label: subtopicData.title }
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
                    <strong>📊 Module Progress Tracking:</strong> As you use the AI Assistant or complete the quiz, your progress toward completing the learning objectives will update.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-800">
                      Topic Grade: {overallGrade}%
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>🟢 Completed</span>
                      <span>🟡 Making Progress</span>
                      <span>🔵 Needs Work</span>
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-2">Learning Objectives</h2>
                <ul className="list-none pl-0 space-y-2 text-gray-700">
                  {objectives.map((obj, idx) => {
                    const status = objectiveProgress[idx];
                    const icon = status === true ? '🟢' : status === 'partial' ? '🟡' : '🔵';
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1">{icon}</span>
                        <span>{typeof obj === 'object' ? obj.text : obj}</span>
                      </li>
                    );
                  })}
                </ul>
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
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Watch Video
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ContentContainer>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col min-h-[70vh] space-y-4">
          <div className="bg-white p-4 rounded shadow-md border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">
                AI Score: <span className="text-green-600 text-xl font-bold">{aiScore}%</span>
              </p>
              <p className="text-lg font-semibold">
                Quiz Score: <span className="text-purple-600 text-xl font-bold">{quizScore}%</span>
              </p>
            </div>
            <button
              className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
              onClick={() => setIsQuizOpen(true)}
            >
              🧠 Take {subtopicData.title} Quiz
            </button>
          </div>

          {QuizModal && (
            <Suspense fallback={<div>Loading quiz...</div>}>
              <QuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                onQuizComplete={handleQuizCompletion}
              />
            </Suspense>
          )}

          <AIChatAssistant
            topicId={topicId}
            subtopicId={subtopicId}
            nestedSubtopicId={nestedSubtopicId}
            objectives={objectives}
            onProgressUpdate={setObjectiveProgress}
            onScoreUpdate={setAIScore}
            QuizModal={QuizModal}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NestedSubtopicPage;