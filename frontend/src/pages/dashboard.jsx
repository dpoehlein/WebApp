import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const userId = localStorage.getItem('student_id');

    useEffect(() => {
        const fetchProgress = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`http://localhost:8000/progress-all/${userId}`);
                const data = await res.json();
                console.log("📊 Loaded Progress Data:", data);
                setProgressData(data);
            } catch (err) {
                console.error("Failed to fetch progress:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [userId]);

    const toggleModule = (subtopicKey) => {
        setExpandedModules((prev) => ({ ...prev, [subtopicKey]: !prev[subtopicKey] }));
    };

    const groupedBySubtopic = progressData.reduce((acc, entry) => {
        const key = `${entry.topic}|||${entry.subtopic}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {});

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            <div className="text-center mb-6">
                <Link
                    to="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
                >
                    Return to Home Page
                </Link>
            </div>

            <h1 className="text-7xl font-bold text-gray-800 mb-6">📊 Your Learning Dashboard</h1>

            {loading ? (
                <p className="text-gray-500">Loading your progress...</p>
            ) : Object.keys(groupedBySubtopic).length === 0 ? (
                <p className="text-gray-600">No progress recorded yet. Start exploring some topics!</p>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedBySubtopic).map(([key, lessons], idx) => {
                        const [topic, subtopic] = key.split('|||');
                        const isExpanded = expandedModules[key];
                        return (
                            <div key={idx} className="border rounded-lg shadow bg-white">
                                <div
                                    onClick={() => toggleModule(key)}
                                    className="cursor-pointer px-6 py-4 bg-gray-100 flex justify-between items-center"
                                >
                                    <div className="w-full">
                                        {/* Course Title */}
                                        <p className="text-lg font-bold text-gray-700 uppercase tracking-wide">
                                            Course: {topic.replace(/_/g, ' ')}
                                        </p>

                                        {/* Header row with Module and Assignment aligned left and right */}
                                        <div className="flex justify-between items-center mt-1">
                                            <h2 className="text-xl font-bold text-blue-700">
                                                Module: {subtopic.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                            </h2>
                                            <span className="text-md text-green-700 font-semibold">
                                                Assignment: 0%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand/Collapse Toggle */}
                                    <span className="text-2xl">{isExpanded ? '−' : '+'}</span>
                                </div>
                                {isExpanded && (
                                    <div className="px-6 pb-4">
                                        {lessons.map((entry, i) => (
                                            <div key={i} className="mt-4 p-4 border rounded bg-gray-50">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <Link
                                                            to={`/topics/${entry.topic}/${entry.subtopic}/${entry.nested_subtopic}`}
                                                            className="text-lg font-semibold text-green-700 hover:underline"
                                                        >
                                                            Lesson: {entry.nested_subtopic
                                                                .replace(/_/g, ' ')
                                                                .replace(/\b\w/g, char => char.toUpperCase())}
                                                        </Link>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center gap-8 text-sm mt-2 md:mt-0">
                                                        <span className="text-green-700 font-semibold">Quiz: {entry.quiz_score ?? '-'}</span>
                                                        <span className="text-gray-500">Last Activity: {new Date(entry.updated_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
