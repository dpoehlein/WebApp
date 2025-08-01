import React from "react";

// Optional: kept here if used elsewhere
const capitalize = (str) =>
  str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

// Map "walkthrough" → "demo", "quiz" → "quiz_modal"
const typeSuffixMap = {
  walkthrough: "demo",
  quiz: "quiz_modal",
};

// Load the dynamic component path
const loadDynamicComponent = (
  type,
  topic_id,
  subtopic_id,
  nested_subtopic_id
) => {
  const suffix = typeSuffixMap[type];
  if (!suffix) return null;

  const file = `/src/components/${topic_id}/${subtopic_id}/${nested_subtopic_id}_${suffix}.jsx`;

  try {
    return React.lazy(() => import(/* @vite-ignore */ file));
  } catch {
    return null;
  }
};

export default loadDynamicComponent;
