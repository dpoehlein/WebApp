import React, { useState } from 'react';

const AssignmentUploadAIChat = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setScore(null);
    setFeedback('');
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:8000/grade/digital_electronics/number_systems", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed.");

      const result = await response.json();
      setScore(result.score);
      setFeedback(result.feedback);

      // Save assignment score to /save-progress
      await fetch("http://localhost:8000/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("student_id"), // Replace with dynamic session/user ID
          topic: "digital_electronics",
          subtopic: "number_systems",
          nested_subtopic: "binary",
          quiz_score: 0,
          ai_score: 0,
          assignment_score: result.score,
          activity_id: "de_ns_bin_001"
        }),
      });
      console.log("✅ Assignment score saved.");

    } catch (err) {
      console.error("Upload error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Upload Your Excel Assignment</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Submit Assignment"}
      </button>

      {score !== null && (
        <div className="mt-4">
          <p className="text-green-700 font-semibold">✅ Score: {score}%</p>
          <p className="text-sm mt-1">💬 Feedback: {feedback}</p>
        </div>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default AssignmentUploadAIChat;