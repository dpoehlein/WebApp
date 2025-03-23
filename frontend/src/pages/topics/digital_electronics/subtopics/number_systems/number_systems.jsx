// src/pages/topics/digital_electronics/subtopics/number_systems/number_systems.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import data from '../../../../../data/topics/digital_electronics/subtopics/number_systems/number_systems.json';
import ContentContainer from '../../../../../components/ContentContainer';
import Breadcrumb from '../../../../../components/Breadcrumb';
import Footer from '../../../../../components/Footer';
import Banner from '../../../../../components/Banner';
import { FaCode, FaHashtag, FaListOl, FaProjectDiagram, FaCodeBranch } from 'react-icons/fa';

const iconMap = {
  binary: <FaCode className="text-blue-600 text-xl" />,        
  octal: <FaListOl className="text-purple-600 text-xl" />,
  hex: <FaHashtag className="text-green-600 text-xl" />,
  bcd: <FaProjectDiagram className="text-orange-600 text-xl" />,
  gray_code: <FaCodeBranch className="text-pink-600 text-xl" />
};

const NumberSystemsPage = () => {
  const topicId = "digital_electronics";
  const topicName = "Digital Electronics";
  const [content, setContent] = useState(null);

  useEffect(() => {
    setContent(data);
  }, []);

  if (!content) {
    return <div className="p-8 text-gray-600">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner
        title={content.title}
        background="/images/digital_electronics/banner.jpg"
      />

      <Breadcrumb
        paths={[
          { label: "Home", to: "/" },
          { label: topicName, to: `/topics/${topicId}` },
          { label: content.title }
        ]}
      />

      <main className="flex-1 w-full px-6 py-8">
        <ContentContainer>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{content.title}</h2>
          <p className="text-gray-700 mb-6">{content.description}</p>

          {content.learning_objectives && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside text-gray-700">
                {content.learning_objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {content.subtopics && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore Subtopics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.subtopics.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/topics/${topicId}/number_systems/${sub.id}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg text-gray-700 shadow border border-gray-200 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                  >
                    {iconMap[sub.id] || <FaListOl className="text-gray-500 text-xl" />}
                    <div>
                      <h4 className="text-md font-semibold">{sub.title}</h4>
                      <p className="text-gray-600 text-sm">{sub.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {content.lti_deep_links && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignment</h3>
              <ul className="space-y-3">
                {content.lti_deep_links.map((link, idx) => (
                  <li key={idx} className="bg-blue-50 p-3 rounded border">
                    <p className="text-blue-700 font-semibold">{link.title}</p>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
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

export default NumberSystemsPage;
