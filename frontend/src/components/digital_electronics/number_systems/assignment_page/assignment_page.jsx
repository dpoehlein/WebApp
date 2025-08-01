import React, { useEffect, useState } from "react";
import DownloadButton from "./download_button";
import AssignmentUploadAIChat from "./assignment_upload_ai_chat";
import instructions from "./instructions";

export default function AssignmentPage() {
  const [grade, setGrade] = useState(null);
  const studentId = localStorage.getItem("student_id"); // or use auth context
  const topicId = "digital_electronics";
  const subtopicId = "number_systems";

  useEffect(() => {
    const fetchGrade = async () => {
      if (!studentId) return;
      try {
        const res = await fetch(`http://localhost:8000/grades/${studentId}`);
        const data = await res.json();
        const match = data.find(
          (g) => g.topic_id === topicId && g.subtopic_id === subtopicId
        );
        if (match) setGrade(match);
      } catch (err) {
        console.error("Failed to fetch grades:", err);
      }
    };
    fetchGrade();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Number Systems Assignment</h1>
      <p className="mb-6 text-gray-700">{instructions.description}</p>

      {grade && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
          <p>
            <strong>Latest Score:</strong> {grade.score}%
          </p>
          <p>
            <strong>Feedback:</strong> {grade.feedback}
          </p>
        </div>
      )}

      <DownloadButton />
      <div className="my-8 border-t border-gray-300"></div>
      <AssignmentUploadAIChat />
    </div>
  );
}
