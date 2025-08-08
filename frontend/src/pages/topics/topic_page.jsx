// src/pages/topics/topic_page.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import DynamicIcon from "../../components/dynamic_icon";
import ContentContainer from "../../components/content_container";
import Breadcrumb from "../../components/breadcrumb";
import Footer from "../../components/footer";
import Banner from "../../components/banner";

const TopicPage = () => {
  const { topic_id } = useParams(); // Use snake_case route param
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 topic_id:", topic_id);
    if (!topic_id) return;

    const path = `/data/topics/${topic_id}/${topic_id}.json`;
    console.log("📁 Fetching topic from:", path);

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.text(); // Parse as raw text first
      })
      .then((text) => {
        try {
          const json = JSON.parse(text);
          setTopic(json);
        } catch (err) {
          console.error("❌ Failed to parse JSON:", err);
          console.log("📄 Response was:", text);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❗ Error loading topic data:", err);
        setTopic(null);
        setLoading(false);
      });
  }, [topic_id]);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading...</div>;
  }

  if (!topic) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Topic not found.</h1>
      </div>
    );
  }

  const bannerImage = `/images/${topic_id}/banner.jpg`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ✅ Banner */}
      <Banner title={topic.title} background={bannerImage} />

      {/* ✅ Breadcrumb (Home > Topic) */}
      <Breadcrumb
        paths={[{ label: "Home", to: "/" }, { label: topic.title }]}
      />

      {/* ✅ Topic Content */}
      <main className="flex-1 w-full px-6 py-8">
        <ContentContainer>
          <p className="mb-6 text-gray-700 text-center text-2xl">
            {topic.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topic.subtopics.map((sub) => (
              <Link
                key={sub.id}
                to={`/topics/${topic_id}/${sub.id}`}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-xl hover:bg-blue-50 transform hover:scale-105 transition duration-300 flex flex-col items-start"
              >
                {sub.icon && (
                  <DynamicIcon
                    iconName={sub.icon}
                    className="text-blue-600 text-3xl mb-2"
                  />
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

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default TopicPage;
