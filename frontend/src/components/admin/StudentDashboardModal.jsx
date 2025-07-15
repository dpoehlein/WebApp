import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const StudentDashboardModal = ({ student, isOpen, onClose }) => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({}); // Track which row is acting

    useEffect(() => {
        if (!student || !isOpen) return;

        const fetchProgress = async () => {
            try {
                const res = await axios.get(`${API_BASE}/progress-all/${student.user_id}`);
                setProgressData(res.data);
                setError(null);
            } catch (err) {
                setError("Failed to load progress.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [student, isOpen]);

    const fetchProgressAgain = async () => {
        try {
            const res = await axios.get(`${API_BASE}/progress-all/${student.user_id}`);
            setProgressData(res.data);
        } catch (err) {
            console.error("Error refreshing progress data:", err);
        }
    };

    const handleMarkCompleted = async (record) => {
        const rowKey = `${record.topic}_${record.subtopic}_${record.nested_subtopic}`;
        setActionLoading((prev) => ({ ...prev, [rowKey]: true }));

        const objectiveLength = record.objective_progress?.length || 6;
        const payload = {
            student_id: student.user_id,
            topic: record.topic,
            subtopic: record.subtopic,
            nested_subtopic: record.nested_subtopic,
            quiz_score: 100,
            ai_score: 100,
            quiz_objective_progress: Array(objectiveLength).fill(true),
            ai_objective_progress: Array(objectiveLength).fill(true),
        };

        try {
            await axios.post(`${API_BASE}/save-progress`, payload);
            await fetchProgressAgain();
        } catch (err) {
            console.error("Failed to mark completed", err);
        } finally {
            setActionLoading((prev) => ({ ...prev, [rowKey]: false }));
        }
    };

    const handleResetScores = async (record) => {
        const rowKey = `${record.topic}_${record.subtopic}_${record.nested_subtopic}`;
        setActionLoading((prev) => ({ ...prev, [rowKey]: true }));

        try {
            await axios.put(`${API_BASE}/reset-scores/${student.user_id}/${record.topic}/${record.subtopic}/${record.nested_subtopic}`);
            await fetchProgressAgain();
        } catch (err) {
            console.error("Failed to reset scores:", err);
        } finally {
            setActionLoading((prev) => ({ ...prev, [rowKey]: false }));
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        Student Progress: {student.first_name} {student.last_name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-black text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                {loading ? (
                    <p>Loading progress...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">Topic</th>
                                <th className="p-2 border">Subtopic</th>
                                <th className="p-2 border">Nested</th>
                                <th className="p-2 border">AI Score</th>
                                <th className="p-2 border">Quiz Score</th>
                                <th className="p-2 border">Topic Grade</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progressData.map((record, idx) => {
                                const rowKey = `${record.topic}_${record.subtopic}_${record.nested_subtopic}`;
                                const isLoading = actionLoading[rowKey];

                                return (
                                    <tr key={idx}>
                                        <td className="p-2 border">{record.topic}</td>
                                        <td className="p-2 border">{record.subtopic}</td>
                                        <td className="p-2 border">{record.nested_subtopic}</td>
                                        <td className="p-2 border">{record.ai_score}</td>
                                        <td className="p-2 border">{record.quiz_score}</td>
                                        <td className="p-2 border">{record.topic_grade}</td>
                                        <td className="p-2 border">
                                            <div className="flex gap-2 flex-row items-center justify-start whitespace-nowrap">
                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => handleMarkCompleted(record)}
                                                    className={`px-2 py-1 rounded text-sm ${isLoading
                                                            ? "bg-green-300 cursor-wait"
                                                            : "bg-green-500 hover:bg-green-600"
                                                        } text-white`}
                                                >
                                                    Mark Completed
                                                </button>
                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => handleResetScores(record)}
                                                    className={`px-2 py-1 rounded text-sm ${isLoading
                                                            ? "bg-red-300 cursor-wait"
                                                            : "bg-red-500 hover:bg-red-600"
                                                        } text-white`}
                                                >
                                                    Reset Scores
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudentDashboardModal;
