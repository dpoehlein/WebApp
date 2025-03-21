// src/pages/topics/TopicPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Static imports for valid Vite support
import digitalElectronics from '../../data/topics/digital_electronics.json';
// import physics from '../../data/topics/physics.json';
// import excel from '../../data/topics/excel.json';
// Add additional topic imports here

const topicMap = {
    digital_electronics: digitalElectronics,
    // physics: physics,
    // excel: excel,
    // Add additional mappings here
};

const TopicPage = () => {
    const { topicId } = useParams();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate async loading for parity with previous dynamic import behavior
        const loadTopic = () => {
            if (topicMap[topicId]) {
                setTopic(topicMap[topicId]);
            } else {
                setTopic(null);
            }
            setLoading(false);
        };
        loadTopic();
    }, [topicId]);

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

    const bannerImage = `/images/${topicId}/banner.jpg`;

    return (
        <div>
            {/* 🔹 Banner Section */}
            <div
                className="relative w-full h-52 flex items-center justify-center text-white text-4xl font-bold shadow-md"
                style={{
                    backgroundImage: `url(${bannerImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <h1 className="relative z-10">{topic.title}</h1>
            </div>

            {/* 🔹 Topic Content */}
            <div className="p-8">
                <p className="mb-6 text-gray-700 text-center">{topic.description}</p>

                {/* 🔹 Subtopics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topic.subtopics.map((sub) => (
                        <Link
                            key={sub.id}
                            to={`/topics/${topicId}/${sub.id}`}
                            className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
                        >
                            <h2 className="text-xl font-semibold mb-1 text-blue-600 hover:underline">{sub.title}</h2>
                            <p className="text-gray-600">{sub.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopicPage;
