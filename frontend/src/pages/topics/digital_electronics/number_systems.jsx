// src/pages/topics/digital_electronics/NumberSystems.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const NumberSystems = () => {
    const { topicId, subtopicId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../../../data/topics/digital_electronics/number_systems.json')
            .then((module) => {
                setData(module.default);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading Number Systems JSON:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-8 text-gray-600">Loading...</div>;
    }

    if (!data) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Subtopic not found.</h1>
            </div>
        );
    }

    const bannerImage = `/images/digital_electronics/banner.jpg`;

    return (
        <div>
            {/* 🔷 Banner Section */}
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
                <h1 className="relative z-10">{data.title}</h1>
            </div>

            <div className="p-8">
                <p className="text-gray-700 text-center mb-6">{data.description}</p>

                {/* 🔷 Learning Objectives */}
                {data.learning_objectives && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Learning Objectives</h2>
                        <ul className="list-disc ml-6 text-gray-700">
                            {data.learning_objectives.map((obj, idx) => (
                                <li key={idx}>{obj}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 🔷 Subtopics Grid */}
                {data.subtopics && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Explore Subtopics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.subtopics.map((sub) => (
                                <Link
                                    key={sub.id}
                                    to={`/topics/digital_electronics/number_systems/${sub.id}`}
                                    className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
                                >
                                    <h3 className="text-xl font-semibold mb-1 text-blue-600 hover:underline">{sub.title}</h3>
                                    <p className="text-gray-600">{sub.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🔷 AI Recommendations */}
                {data.ai_recommendations && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800">AI-Powered Recommendations</h2>
                        <ul className="list-disc ml-6 text-gray-700">
                            {data.ai_recommendations.map((rec, idx) => (
                                <li key={idx}><a href="#" className="text-blue-500 underline">{rec}</a></li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 🔷 LTI Deep Links */}
                {data.lti_deep_links && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800">LTI Activities</h2>
                        <ul className="list-disc ml-6 text-gray-700">
                            {data.lti_deep_links.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.url} className="text-blue-500 underline" target="_blank" rel="noreferrer">
                                        {link.title}
                                    </a>
                                    <p className="text-sm text-gray-600">{link.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NumberSystems;
