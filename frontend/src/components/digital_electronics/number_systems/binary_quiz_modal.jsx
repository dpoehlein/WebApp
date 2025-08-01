import React, { useState } from "react";
import axios from "axios";

const BinaryQuizModal = ({ isOpen, onClose, onQuizComplete }) => {
  if (!isOpen) return null;

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
    },
    {
      type: "definition",
      question: "What is the value of the most significant bit (MSB) in 8-bit binary?",
      correctAnswer: "128"
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

  const handleSubmit = async () => {
    let score = 0;

    const objectiveCounts = {
      0: { correct: 0, total: 0 }, // base-2
      1: { correct: 0, total: 0 }, // decimal ➝ binary
      2: { correct: 0, total: 0 }, // binary ➝ decimal
      3: { correct: 0, total: 0 }, // MSB / LSB
      4: { correct: 0, total: 0 }, // nibble/byte
      5: { correct: 0, total: 0 }  // place values
    };

    questions.forEach((q, index) => {
      const answer = (answers[index] || "").trim();
      const correct = q.correctAnswer.trim();
      const isCorrect = answer === correct;

      let objIndex = null;
      if (q.type === "bin_to_dec") objIndex = 2;
      if (q.type === "dec_to_bin") objIndex = 1;
      if (q.type === "definition") {
        if (q.question.includes("nibble") || q.question.includes("byte")) objIndex = 4;
        else if (q.question.includes("most significant")) objIndex = 3;
        else if (q.question.includes("bits are in")) objIndex = 0;
        else objIndex = 5;
      }

      if (objIndex !== null) {
        objectiveCounts[objIndex].total++;
        if (isCorrect) objectiveCounts[objIndex].correct++;
      }

      if (isCorrect) score++;
    });

    const finalScore = Math.round((score / questions.length) * 100);
    setSubmitted(true);
    setScore(finalScore);

    const objective_progress = Object.keys(objectiveCounts).map((key) => {
      const { correct, total } = objectiveCounts[key];
      const ratio = total === 0 ? 0 : correct / total;
      if (ratio >= 0.67) return true;
      if (ratio >= 0.34) return "partial";
      return false;
    });

    try {
      await axios.post("http://localhost:8000/save-progress", {
        student_id: "dan123",
        topic: "digital_electronics",
        subtopic: "number_systems",
        nested_subtopic: "binary",
        quiz_score: finalScore,
        quiz_objective_progress: objective_progress
      });
    } catch (err) {
      console.error("❌ Failed to save quiz progress:", err);
    }

    onQuizComplete({
      score: finalScore,
      objective_progress
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white relative rounded-xl shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

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
                  <p className={`mt-1 text-sm ${answers[i]?.trim() === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[i]?.trim() === q.correctAnswer
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

export default BinaryQuizModal;
