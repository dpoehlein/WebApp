// src/components/digital_electronics/number_systems/BinaryQuizModal.jsx

import React, { useState } from "react";

const BinaryQuizModal = ({ isOpen, onClose, onQuizComplete }) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

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

    const createClosedDefinitionQuestion = () => {
        return [
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
    };

    const handleStartQuiz = () => {
        const generated = [
            ...generateUniqueBinaryToDecimal(3),
            ...generateUniqueDecimalToBinary(3),
            ...createClosedDefinitionQuestion()
        ];
        setQuestions(generated);
        setAnswers({});
        setSubmitted(false);
        console.log("🟢 Quiz started with questions:", generated);
    };

    const handleChange = (index, value) => {
        setAnswers({ ...answers, [index]: value });
    };

    const calculateScoreAndReport = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i]?.trim() === q.correctAnswer) {
                correct++;
            }
        });

        const score = Math.round((correct / questions.length) * 100);

        // Map types to learning objectives
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

        console.log("📊 Final Score:", score);
        console.log("✅ Achieved Objectives:", achievedObjectives);
        console.log("📤 Sending to onQuizComplete...");

        if (onQuizComplete && typeof onQuizComplete === 'function') {
            onQuizComplete({
                score,
                objectiveKeys: achievedObjectives
            });
        } else {
            console.warn("⚠️ onQuizComplete function is missing or not a function.");
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
        console.log("📝 Submitting quiz with answers:", answers);
        calculateScoreAndReport();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">Binary Quiz</h2>

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
                                        className={`mt-1 text-sm ${answers[i]?.trim() === q.correctAnswer
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

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-black font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BinaryQuizModal;
