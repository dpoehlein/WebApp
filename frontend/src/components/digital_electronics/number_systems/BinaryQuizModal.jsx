import React, { useState, useEffect } from "react";

const BinaryQuizModal = ({ isOpen, onClose, onQuizComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const generateUniqueBinaryToDecimal = (count = 3) => {
    const questions = [];
    const used = new Set();

    while (questions.length < count) {
      const dec = Math.floor(Math.random() * (255 - 10 + 1)) + 10;
      if (!used.has(dec)) {
        used.add(dec);
        const bin = dec.toString(2).padStart(8, '0');
        questions.push({
          type: "bin_to_dec",
          question: `What is the decimal value of binary ${bin}?`,
          correctAnswer: dec.toString()
        });
      }
    }

    return questions;
  };

  const generateUniqueDecimalToBinary = (count = 3) => {
    const questions = [];
    const used = new Set();

    while (questions.length < count) {
      const dec = Math.floor(Math.random() * (255 - 10 + 1)) + 10;
      if (!used.has(dec)) {
        used.add(dec);
        questions.push({
          type: "dec_to_bin",
          question: `What is the 8-bit binary representation of decimal ${dec}?`,
          correctAnswer: dec.toString(2).padStart(8, '0')
        });
      }
    }

    return questions;
  };

  const createClosedDefinitionQuestion = () => [
    {
      type: "definition",
      question: "How many bits are in the binary number 101101?",
      correctAnswer: "6"
    },
    {
      type: "definition",
      question: "How many bits make up a nibble?",
      correctAnswer: "4"
    },
    {
      type: "definition",
      question: "How many bits make up a byte?",
      correctAnswer: "8"
    }
  ];

  const handleStartQuiz = () => {
    const generated = [
      ...generateUniqueBinaryToDecimal(3),
      ...generateUniqueDecimalToBinary(3),
      ...createClosedDefinitionQuestion()
    ];
    setQuestions(generated);
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
      const objectiveMap = {
        bin_to_dec: 'binary_conversion_binary_to_decimal',
        dec_to_bin: 'binary_conversion_decimal_to_binary',
        definition: 'binary_structure_understanding'
      };

      const objectiveCounts = {};
      questions.forEach((q, i) => {
        const key = objectiveMap[q.type];
        if (!objectiveCounts[key]) objectiveCounts[key] = { correct: 0, total: 0 };
        objectiveCounts[key].total++;
        if (answers[i]?.trim() === q.correctAnswer) {
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

  useEffect(() => {
    if (score !== null && score > 0) {
      const saveQuizScore = async () => {
        try {
          await fetch("http://localhost:8000/save-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: localStorage.getItem("student_id"), // Replace this with actual user ID from context/auth
              topic: "digital_electronics",
              subtopic: "number_systems",
              nested_subtopic: "binary",
              quiz_score: score,
              ai_score: 0,
              assignment_score: 0,
              activity_id: "de_ns_bin_001"
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Binary Quiz</h2>

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
                  <p className={`mt-1 text-sm \${answers[i]?.trim() === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[i]?.trim() === q.correctAnswer
                      ? '✅ Correct'
                      : `❌ Correct Answer: \${q.correctAnswer}`}
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

export default BinaryQuizModal;