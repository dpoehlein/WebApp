import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';

import ContentContainer from "../../components/ContentContainer";
import AIChatAssistant from "../../components/AIChatAssistant";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import Banner from "../../components/Banner";

const walkthroughComponents = {
  binary: React.lazy(() => import('../../components/digital_electronics/number_systems/BinaryDemo')),
  // Add more as needed
};

const NestedSubtopicPage = ({
  topicId: propTopicId,
  subtopicId: propSubtopicId,
  nestedSubtopicId: propNestedSubtopicId
}) => {
  const routeParams = useParams();
  const topicId = propTopicId || routeParams.topicId;
  const subtopicId = propSubtopicId || routeParams.subtopicId;
  const nestedSubtopicId = propNestedSubtopicId || routeParams.nestedSubtopicId;

  const [subtopicData, setSubtopicData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    Promise.all([
      import(`../../data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/subtopic.json`),
      import(`../../data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/practice.json`),
      import(`../../data/topics/${topicId}/subtopics/${subtopicId}/${nestedSubtopicId}/videos.json`)
    ])
      .then(([subtopicRes, practiceRes, videoRes]) => {
        setSubtopicData(subtopicRes.default);
        setPracticeData(practiceRes.default);
        setVideoData(videoRes.default);
      })
      .catch((err) => console.error("Failed to load nested subtopic data:", err));
  }, [topicId, subtopicId, nestedSubtopicId]);

  if (!subtopicData) return <div className="p-8 text-gray-600">Loading...</div>;

  const topicName = topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const subtopicName = subtopicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const WalkthroughComponent = walkthroughComponents[nestedSubtopicId] || null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner
        title={subtopicData.title}
        background={`/images/${topicId}/banner.jpg`}
      />

      <Breadcrumb
        paths={[
          { label: "Home", to: "/" },
          { label: topicName, to: `/topics/${topicId}` },
          { label: subtopicName, to: `/topics/${topicId}/subtopics/${subtopicId}` },
          { label: subtopicData.title }
        ]}
      />

      <main className="flex-1 w-full px-6 py-8">
        <ContentContainer>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="w-full lg:w-1/2 space-y-6">
              <p className="text-gray-700 text-lg font-medium">{subtopicData.description}</p>

              {subtopicData.learning_objectives && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Learning Objectives</h2>
                  <ul className="list-disc list-inside text-gray-700">
                    {subtopicData.learning_objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {WalkthroughComponent ? (
                <Suspense fallback={<div>Loading visual...</div>}>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">How It Works</h2>
                    <WalkthroughComponent />
                  </div>
                </Suspense>
              ) : practiceData?.problems?.length > 0 ? (
                <div>
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
                <div>
                  <h2 className="text-lg font-semibold mb-2">Recommended Videos</h2>
                  <ul className="space-y-3">
                    {videoData.videos.map((vid, idx) => (
                      <li key={idx}>
                        <p className="text-blue-700 font-semibold">{vid.title}</p>
                        <p className="text-gray-600 text-sm">{vid.description}</p>
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
            </div>

            {/* Right Column: AI Assistant */}
            <div className="w-full lg:w-1/2">
              <AIChatAssistant topicId={nestedSubtopicId} />
            </div>
          </div>
        </ContentContainer>
      </main>

      <Footer />
    </div>
  );
};

export default NestedSubtopicPage;
