import React, { useState, useEffect } from "react";

const HexadecimalQuizModal = ({ isOpen, onClose, onQuizComplete }) => {

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
              nested_subtopic: "hexadecimal",
              quiz_score: score,
              ai_score: 0,
              assignment_score: 0,
              activity_id: "de_ns_hex_001"
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
      "type": "dec_to_hex",
      "question": "What is the hexadecimal representation of decimal 255?",
      "correctAnswer": "FF"
    },
    {
      "type": "hex_to_dec",
      "question": "What is the decimal value of hexadecimal A0?",
      "correctAnswer": "160"
    },
    {
      "type": "dec_to_hex",
      "question": "What is the hexadecimal representation of decimal 175?",
      "correctAnswer": "AF"
    },
    {
      "type": "hex_to_dec",
      "question": "What is the decimal value of hexadecimal 4D?",
      "correctAnswer": "77"
    },
    {
      "type": "dec_to_hex",
      "question": "What is the hexadecimal representation of decimal 99?",
      "correctAnswer": "63"
    },
    {
      "type": "dec_to_hex",
      "question": "What is the hexadecimal representation of decimal 188?",
      "correctAnswer": "BC"
    },
    {
      "type": "hex_to_dec",
      "question": "What is the decimal value of hexadecimal 7F?",
      "correctAnswer": "127"
    },
    {
      "type": "hex_to_dec",
      "question": "What is the decimal value of hexadecimal 10?",
      "correctAnswer": "16"
    },
    {
      "type": "dec_to_hex",
      "question": "What is the hexadecimal representation of decimal 200?",
      "correctAnswer": "C8"
    },
    {
      "type": "hex_to_dec",
      "question": "What is the decimal value of hexadecimal 32?",
      "correctAnswer": "50"
    }
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
      if (answers[i]?.trim().toUpperCase() === q.correctAnswer.toUpperCase()) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    if (onQuizComplete) {
      const objectiveMap = {
        dec_to_hex: 'hex_conversion_decimal_to_hex',
        hex_to_dec: 'hex_conversion_hex_to_decimal'
      };

      const objectiveCounts = {};
      questions.forEach((q, i) => {
        const key = objectiveMap[q.type];
        if (!objectiveCounts[key]) objectiveCounts[key] = { correct: 0, total: 0 };
        objectiveCounts[key].total++;
        if (answers[i]?.trim().toUpperCase() === q.correctAnswer.toUpperCase()) {
          objectiveCounts[key].correct++;
        }
      });

      const achievedObjectives = Object.entries(objectiveCounts)
        .filter(([_, stats]) => stats.correct / stats.total >= 0.67)
        .map(([key]) => key);

      onQuizComplete({
        score: finalScore,
        objectiveKeys: achievedObjectives
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Hexadecimal Quiz</h2>

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
                <p className="font-medium">{i + 1}. {q.question}</p>
                <input
                  type="text"
                  className="border rounded px-2 py-1 mt-1 w-full"
                  value={answers[i] || ""}
                  onChange={(e) => handleChange(i, e.target.value)}
                  disabled={submitted}
                />
                {submitted && (
                  <p className={`mt-1 text-sm ${answers[i]?.trim().toUpperCase() === q.correctAnswer.toUpperCase() ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[i]?.trim().toUpperCase() === q.correctAnswer.toUpperCase()
                      ? '✅ Correct'
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

export default HexadecimalQuizModal;