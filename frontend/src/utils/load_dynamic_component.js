// src/utils/load_dynamic_component.js
import React from "react";

// Capitalize for future use if needed (not used currently)
const capitalize = (str) =>
  str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

// Load the dynamic component path
const loadDynamicComponent = (
  type,
  topic_id,
  subtopic_id,
  nested_subtopic_id
) => {
  const filename =
    type === "walkthrough"
      ? `${nested_subtopic_id}_demo.jsx`
      : `${nested_subtopic_id}_quiz_modal.jsx`;

  const path = `../components/${topic_id}/${subtopic_id}/${filename}`;

  try {
    return React.lazy(() => import(/* @vite-ignore */ path));
  } catch {
    return null;
  }
};

export default loadDynamicComponent;
