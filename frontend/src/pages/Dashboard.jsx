import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('student_id'); // Assumes user ID is stored here

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:8000/progress-all/${userId}`);
        const data = await res.json();
        setProgressData(data);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [userId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📊 Your Learning Dashboard</h1>

      {loading ? (
        <p className="text-gray-500">Loading your progress...</p>
      ) : progressData.length === 0 ? (
        <p className="text-gray-600">No progress recorded yet. Start exploring some topics!</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 rounded shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Topic</th>
              <th className="border px-4 py-2">Subtopic</th>
              <th className="border px-4 py-2">Nested Subtopic</th>
              <th className="border px-4 py-2">AI Score</th>
              <th className="border px-4 py-2">Quiz Score</th>
              <th className="border px-4 py-2">Assignment Score</th>
              <th className="border px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((entry, idx) => (
              <tr key={idx} className="text-center">
                <td className="border px-2 py-1">{entry.topic}</td>
                <td className="border px-2 py-1">{entry.subtopic}</td>
                <td className="border px-2 py-1 capitalize">{entry.nested_subtopic}</td>
                <td className="border px-2 py-1 text-blue-700 font-medium">{entry.ai_score ?? '-'}</td>
                <td className="border px-2 py-1 text-green-700 font-medium">{entry.quiz_score ?? '-'}</td>
                <td className="border px-2 py-1 text-purple-700 font-medium">{entry.assignment_score ?? '-'}</td>
                <td className="border px-2 py-1 text-gray-600">{new Date(entry.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;