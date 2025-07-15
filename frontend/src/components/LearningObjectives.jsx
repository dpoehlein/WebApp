import React from "react";

const LearningObjectives = ({ objectives = [], progress = [] }) => {
    console.log("🧠 LearningObjectives received progress:", progress);

    return (
        <div className="mb-6">
            <ul className="space-y-2">
                {objectives.map((obj, index) => {
                    const status = progress[index];
                    let statusLabel = "🔵 Needs Work";

                    if (status === true) {
                        statusLabel = "🟢 Completed";
                    } else if (status === "progress") {
                        statusLabel = "🟡 Making Progress";
                    }

                    return (
                        <li
                            key={index}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-white border rounded px-3 py-2"
                        >
                            <span className="text-gray-800">{obj}</span>
                            <span
                                className={`text-sm ${status === true
                                        ? "text-green-600"
                                        : status === "progress"
                                            ? "text-yellow-500"
                                            : "text-blue-500"
                                    }`}
                            >
                                {statusLabel}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default LearningObjectives;

