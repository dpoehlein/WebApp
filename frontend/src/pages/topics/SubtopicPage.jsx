// src/pages/topics/SubtopicPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentContainer from '../../components/ContentContainer';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import Banner from '../../components/Banner';
import NestedSubtopicCard from '../../components/NestedSubtopicCard';

const SubtopicPage = () => {
  const { topicId, subtopicId } = useParams();
  const [subtopicData, setSubtopicData] = useState(null);

  useEffect(() => {
    fetch(`/data/topics/${topicId}/subtopics/${subtopicId}/${subtopicId}.json`)
      .then(res => res.json())
      .then(data => setSubtopicData(data))
      .catch(err => {
        console.error("Error loading subtopic:", err);
        setSubtopicData(null);
      });
  }, [topicId, subtopicId]);

  if (!subtopicData) {
    return <div className="p-8 text-red-600 text-lg">Topic not found.</div>;
  }

  const topicName = topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const bannerImage = `/images/${topicId}/banner.jpg`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner title={subtopicData.title} background={bannerImage} />

      <Breadcrumb
        paths={[
          { label: "Home", to: "/" },
          { label: topicName, to: `/topics/${topicId}` },
          { label: subtopicData.title }
        ]}
      />

      <main className="flex-1 w-full px-6 py-8">
        <ContentContainer>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{subtopicData.title}</h2>
          <p className="text-gray-700 mb-6">{subtopicData.description}</p>

          {subtopicData.learning_objectives && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {subtopicData.subtopics_title || "Explore Subtopics"}
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {subtopicData.learning_objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {subtopicData.subtopics && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore Nested Topics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {subtopicData.subtopics.map((sub) => (
                  <NestedSubtopicCard
                    key={sub.id}
                    id={sub.id}
                    title={sub.title}
                    description={sub.description}
                    parentId={subtopicId}
                    topicId={topicId}
                    icon={sub.icon} // Assuming each subtopic has an icon property
                  />
                ))}
              </div>
            </div>
          )}

          {subtopicData.lti_deep_links && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignment</h3>
              <ul className="space-y-3">
                {subtopicData.lti_deep_links.map((link, idx) => (
                  <li key={idx} className="bg-blue-50 p-3 rounded border">
                    <p className="text-blue-700 font-semibold">{link.title}</p>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                    <button
                      onClick={() => window.location.href = `/assignments/${subtopicId}`}
                      className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
                    >
                      Open Assignment
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ContentContainer>
      </main>

      <Footer />
    </div>
  );
};

export default SubtopicPage;
