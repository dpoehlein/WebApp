// src/pages/topics/SubtopicPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentContainer from "../../components/content_container";
import Breadcrumb from "../../components/breadcrumb";
import Footer from "../../components/footer";
import Banner from "../../components/banner";
import NestedSubtopicCard from "../../components/nested_subtopic_card";

const SubtopicPage = () => {
  const { topic_id, subtopic_id } = useParams();
  const [subtopicData, setSubtopicData] = useState(null);

  useEffect(() => {
    fetch(
      `/data/topics/${topic_id}/subtopics/${subtopic_id}/${subtopic_id}.json`
    )
      .then((res) => res.json())
      .then((data) => setSubtopicData(data))
      .catch((err) => {
        console.error("Error loading subtopic:", err);
        setSubtopicData(null);
      });
  }, [topic_id, subtopic_id]);

  if (!subtopicData) {
    return <div className="p-8 text-red-600 text-lg">Topic not found.</div>;
  }

  const topicName = topic_id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const bannerImage = `/images/${topic_id}/banner.jpg`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner title={subtopicData.title} background={bannerImage} />

      <Breadcrumb
        paths={[
          { label: "Home", to: "/" },
          { label: topicName, to: `/topics/${topic_id}` },
          { label: subtopicData.title },
        ]}
      />

      <main className="flex-1 w-full px-6 py-8">
        <ContentContainer>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {subtopicData.title}
          </h2>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Explore Nested Topics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {subtopicData.subtopics.map((sub) => (
                  <NestedSubtopicCard
                    key={sub.id}
                    id={sub.id}
                    title={sub.title}
                    description={sub.description}
                    parentId={subtopic_id}
                    topicId={topic_id}
                    icon={sub.icon} // Assuming each subtopic has an icon property
                  />
                ))}
              </div>
            </div>
          )}

          {subtopicData.lti_deep_links && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Assignment
              </h3>
              <ul className="space-y-3">
                {subtopicData.lti_deep_links.map((link, idx) => (
                  <li key={idx} className="bg-blue-50 p-3 rounded border">
                    <p className="text-blue-700 font-semibold">{link.title}</p>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                    <button
                      onClick={() =>
                        (window.location.href = `/assignments/${subtopicId}`)
                      }
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
