import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import DynamicIcon from '../../components/DynamicIcon';
import ContentContainer from '../../components/ContentContainer';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import Banner from '../../components/Banner';

const TopicPage = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/data/topics/${topicId}/${topicId}.json`)
      .then(res => res.json())
      .then(data => {
        setTopic(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading topic data:", err);
        setTopic(null);
        setLoading(false);
      });
  }, [topicId]);

  if (loading) return <div className="p-8 text-gray-600">Loading...</div>;

  if (!topic) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Topic not found.</h1>
      </div>
    );
  }

  const bannerImage = `/images/${topicId}/banner.jpg`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Banner title={topic.title} background={bannerImage} />

      <Breadcrumb
        paths={[
          { label: 'Home', to: '/' },
          { label: topic.title }
        ]}
      />

      <main className="flex-1 w-full px-6 py-8">
        <ContentContainer>
          <p className="mb-6 text-gray-700 text-center text-2xl">{topic.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topic.subtopics.map((sub) => (
              <Link
                key={sub.id}
                to={`/topics/${topicId}/${sub.id}`}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-xl hover:bg-blue-50 transform hover:scale-105 transition duration-300 flex flex-col items-start"
              >
                {sub.icon && (
                  <DynamicIcon iconName={sub.icon} className="text-blue-600 text-3xl mb-2" />
                )}
                <h2 className="text-xl font-semibold mb-1 text-blue-600 hover:underline">
                  {sub.title}
                </h2>
                <p className="text-gray-600">{sub.description}</p>
              </Link>
            ))}
          </div>
        </ContentContainer>
      </main>

      <Footer />
    </div>
  );
};

export default TopicPage;

