import React, { useState, useEffect } from "react";

const OctalQuizModal = ({ isOpen, onClose, onQuizComplete }) => {

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
              nested_subtopic: "octal",
              quiz_score: score,
              ai_score: 0,
              assignment_score: 0,
              activity_id: "de_ns_oct_001"
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
      "type": "dec_to_oct",
      "question": "What is the octal representation of decimal 210?",
      "correctAnswer": "322"
    },
    {
      "type": "oct_to_dec",
      "question": "What is the decimal value of octal 112?",
      "correctAnswer": "74"
    },
    {
      "type": "oct_to_dec",
      "question": "What is the decimal value of octal 312?",
      "correctAnswer": "202"
    },
    {
      "type": "oct_to_dec",
      "question": "What is the decimal value of octal 357",
      "correctAnswer": "239"
    },
    {
      "type": "dec_to_oct",
      "question": "What is the octal representation of decimal 85?",
      "correctAnswer": "125"
    },
    {
      "type": "dec_to_oct",
      "question": "What is the octal representation of decimal 112?",
      "correctAnswer": "160"
    },
    {
      "type": "oct_to_dec",
      "question": "What is the decimal value of octal 245?",
      "correctAnswer": "165"
    },
    {
      "type": "dec_to_oct",
      "question": "What is the octal representation of decimal 173?",
      "correctAnswer": "255"
    },
    {
      "type": "dec_to_oct",
      "question": "What is the octal representation of decimal 152?",
      "correctAnswer": "230"
    },
    {
      "type": "oct_to_dec",
      "question": "What is the decimal value of octal 337?",
      "correctAnswer": "223"
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
      if (answers[i]?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    if (onQuizComplete) {
      const objectiveMap = {
        dec_to_oct: 'octal_conversion_decimal_to_octal',
        oct_to_dec: 'octal_conversion_octal_to_decimal'
      };

      const objectiveCounts = {};
      questions.forEach((q, i) => {
        const key = objectiveMap[q.type];
        if (!objectiveCounts[key]) objectiveCounts[key] = { correct: 0, total: 0 };
        objectiveCounts[key].total++;
        if (answers[i]?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
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
        <h2 className="text-xl font-bold mb-4">Octal Quiz</h2>

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
                  <p className={`mt-1 text-sm ${answers[i]?.trim().toLowerCase() === q.correctAnswer.toLowerCase() ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[i]?.trim().toLowerCase() === q.correctAnswer.toLowerCase()
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

export default OctalQuizModal;