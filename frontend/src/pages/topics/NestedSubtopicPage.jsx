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
  // Add more walkthrough components here
};

const NestedSubtopicPage = ({
  topicId: propTopicId,
  subtopicId: propSubtopicId,
  nestedSubtopicId: propNestedSubtopicId,
  renderCustomContent // <-- Accept custom content
}) => {
  const routeParams = useParams();
  const topicId = propTopicId || routeParams.topicId;
  const subtopicId = propSubtopicId || routeParams.subtopicId;
  const nestedSubtopicId = propNestedSubtopicId || routeParams.nestedSubtopicId;

  const [subtopicData, setSubtopicData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [objectiveProgress, setObjectiveProgress] = useState([]);

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

  if (!subtopicData) return <div className="p-8 text-gray-600">Loading...</div>;

  const topicName = topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const subtopicName = subtopicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const WalkthroughComponent = walkthroughComponents[nestedSubtopicId] || null;
  const objectives = learningObjectives[nestedSubtopicId] || [];

  const completed = objectiveProgress.filter(p => p === true).length;
  const total = objectives.length;
  const overallGrade = total > 0 ? Math.round((completed / total) * 100) : 0;

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
          { label: subtopicName, to: `/topics/${topicId}/subtopics/${subtopicId}` },
          { label: subtopicData.title }
        ]}
      />

      {/* Main content and AI side-by-side */}
      <main className="flex-1 w-full px-6 py-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column - Content */}
        <div className="w-full lg:w-1/2 overflow-y-auto pr-2">
          <ContentContainer className="max-w-none">
            {typeof renderCustomContent === 'function' && renderCustomContent()}
            <p className="text-gray-700 text-lg font-medium">
              {subtopicData.description}
            </p>

            {objectives.length > 0 && (
              <div className="mt-4">
                {/* 🧠 Progress Explanation + Grade Box */}
                <div className="mb-4 p-4 rounded bg-white border shadow">
                  <p className="text-md text-gray-800 font-medium mb-2">
                    <strong>📊 Module Progress Tracking:</strong> As you use the AI Assistant to learn, your progress toward completing the learning objectives will update.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-800">
                      Overall Grade: {overallGrade}%
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>🟢 Completed</span>
                      <span>🟡 Showing Progress</span>
                      <span>🔵 Pending</span>
                    </div>
                  </div>
                </div>

                {/* Learning Objectives */}
                <h2 className="text-lg font-semibold mb-2">Learning Objectives</h2>
                <ul className="list-none pl-0 space-y-2 text-gray-700">
                  {objectives.map((obj, idx) => {
                    const status = objectiveProgress[idx];
                    const icon = status === true ? '🟢' : status === 'partial' ? '🟡' : '🔵';
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1">{icon}</span>
                        <span>{obj}</span>
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

        {/* Right Column - AI Assistant */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-[70vh]">
          <AIChatAssistant
            topicId={nestedSubtopicId}
            objectives={objectives}
            onProgressUpdate={setObjectiveProgress}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NestedSubtopicPage;