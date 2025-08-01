import React, { useState, useEffect } from "react";

const GraycodeQuizModal = ({ isOpen, onClose, onQuizComplete }) => {
  useEffect(() => {
    if (score !== null && score > 0) {
      const saveQuizScore = async () => {
        try {
          await fetch("http://localhost:8000/save-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: localStorage.getItem("student_id"),
              topic: "digital_electronics",
              subtopic: "number_systems",
              nested_subtopic: "gray_code",
              quiz_score: score,
              assignment_score: 0,
              activity_id: "de_ns_gray_001",
            }),
          });
          console.log("✅ Quiz score saved to backend.");
        } catch (error) {
          console.error("❌ Failed to save quiz score:", error);
        }
      };
      saveQuizScore();
    }
  }, [score]);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const generatedQuestions = [
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 0?",
      correctAnswer: "00000",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 1?",
      correctAnswer: "00001",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 2?",
      correctAnswer: "00011",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 3?",
      correctAnswer: "00010",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 4?",
      correctAnswer: "00110",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 5?",
      correctAnswer: "00111",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 6?",
      correctAnswer: "00101",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 7?",
      correctAnswer: "00100",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 8?",
      correctAnswer: "01100",
    },
    {
      type: "dec_to_gray",
      question: "What is the 5-bit Gray code for decimal 9?",
      correctAnswer: "01101",
    },
  ];

  const handleStartQuiz = () => {
    setQuestions(generatedQuestions);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const handleChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i]?.trim() === q.correctAnswer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    if (onQuizComplete) {
      onQuizComplete({
        score: finalScore,
        objectiveKeys: ["gray_code_conversion_decimal_to_gray"],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Gray Code Quiz</h2>

        {submitted && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-green-700">
              Final Score: {score}%
            </div>
            <div className="flex gap-2">
              <button
                className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                onClick={handleStartQuiz}
              >
                Retake Quiz
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!questions.length ? (
          <button
            onClick={handleStartQuiz}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Quiz
          </button>
        ) : (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i}>
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>
                <input
                  type="text"
                  className="border rounded px-2 py-1 mt-1 w-full"
                  value={answers[i] || ""}
                  onChange={(e) => handleChange(i, e.target.value)}
                  disabled={submitted}
                />
                {submitted && (
                  <p
                    className={`mt-1 text-sm ${
                      answers[i]?.trim() === q.correctAnswer
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {answers[i]?.trim() === q.correctAnswer
                      ? "✅ Correct"
                      : `❌ Correct Answer: ${q.correctAnswer}`}
                  </p>
                )}
              </div>
            ))}

            {!submitted && (
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Submit Quiz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GraycodeQuizModal;
