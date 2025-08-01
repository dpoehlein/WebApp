import React, { useState, useEffect } from "react";

const BcdQuizModal = ({ isOpen, onClose, onQuizComplete }) => {
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
              nested_subtopic: "bcd",
              quiz_score: score,
              assignment_score: 0,
              activity_id: "de_ns_bcd_001",
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
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 37?",
      correctAnswer: "0011 0111",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 85?",
      correctAnswer: "1000 0101",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 109?",
      correctAnswer: "0001 0000 1001",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 62?",
      correctAnswer: "0110 0010",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 253?",
      correctAnswer: "0010 0101 0011",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 99?",
      correctAnswer: "1001 1001",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 100?",
      correctAnswer: "0001 0000 0000",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 64?",
      correctAnswer: "0110 0100",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 123?",
      correctAnswer: "0001 0010 0011",
    },
    {
      type: "dec_to_bcd",
      question: "What is the BCD representation of decimal 41?",
      correctAnswer: "0100 0001",
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
      if (
        answers[i]?.trim().replace(/\s+/g, "") ===
        q.correctAnswer.replace(/\s+/g, "")
      ) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    if (onQuizComplete) {
      onQuizComplete({
        score: finalScore,
        objectiveKeys: ["bcd_conversion_decimal_to_bcd"],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">BCD Quiz</h2>

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
                      answers[i]?.trim().replace(/\s+/g, "") ===
                      q.correctAnswer.replace(/\s+/g, "")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {answers[i]?.trim().replace(/\s+/g, "") ===
                    q.correctAnswer.replace(/\s+/g, "")
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

export default BcdQuizModal;
