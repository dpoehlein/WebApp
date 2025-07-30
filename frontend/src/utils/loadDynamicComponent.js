import React from "react";

// Convert "gray_code" → "GrayCode"
const capitalize = (str) =>
    str
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

// Load the dynamic component path
const loadDynamicComponent = (type, topicId, subtopicId, nestedSubtopicId) => {
    const base = `/src/components/${topicId}/${subtopicId}/${capitalize(nestedSubtopicId)}`;
    const file =
        type === "walkthrough" ? `${base}Demo.jsx` : `${base}QuizModal.jsx`;

    try {
        return React.lazy(() => import(/* @vite-ignore */ file));
    } catch {
        return null;
    }
};

export default loadDynamicComponent;
