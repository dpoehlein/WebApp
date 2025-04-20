import React, { useState } from "react";

const BCDQuizModal = ({ isOpen, onClose, onQuizComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const generateQuiz = () => {
    const q = [];
    const used = new Set();
    while (q.length < 5) {
      const dec = Math.floor(Math.random() * 100);
      if (!used.has(dec)) {
        used.add(dec);
        const bcd = dec
          .toString()
          .split("")
          .map((d) => parseInt(d).toString(2).padStart(4, "0"))
          .join(" ");
        q.push({
          type: "dec_to_bcd",
          question: `What is the BCD encoding of ${dec}?`,
          correctAnswer: bcd
        });
      }
    }
    setQuestions(q);
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
      const achieved = finalScore >= 67 ? ["bcd_conversion"] : [];
      onQuizComplete({
        score: finalScore,
        objectiveKeys: achieved
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
            <div className="text-lg font-semibold text-green-700">Final Score: {score}%</div>
            <div className="flex gap-2">
              <button className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500" onClick={generateQuiz}>Retake Quiz</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={onClose}>Close</button>
            </div>
          </div>
        )}

        {!questions.length ? (
          <button onClick={generateQuiz} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Start Quiz</button>
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
                  <p className={\`mt-1 text-sm \${answers[i]?.trim() === q.correctAnswer ? 'text-green-600' : 'text-red-600'}\`}>
                    {answers[i]?.trim() === q.correctAnswer
                      ? '✅ Correct'
                      : \`❌ Correct Answer: \${q.correctAnswer}\`}
                  </p>
                )}
              </div>
            ))}
            {!submitted && (
              <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Submit Quiz</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BCDQuizModal;