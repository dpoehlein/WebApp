// src/pages/topics/SubtopicPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentContainer from '../../components/ContentContainer';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import Banner from '../../components/Banner';

const SubtopicPage = () => {
  const { topicId, subtopicId } = useParams();
  const [subtopicData, setSubtopicData] = useState(null);

  useEffect(() => {
    import(`../../data/topics/${topicId}/subtopics/${subtopicId}/${subtopicId}.json`)
      .then((res) => setSubtopicData(res.default))
      .catch((err) => {
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside text-gray-700">
                {subtopicData.learning_objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
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
                    <a
                      href={link.url}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Launch Assignment
                    </a>
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
