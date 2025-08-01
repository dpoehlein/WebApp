// src/components/ContentContainer.jsx
import React from "react";

const ContentContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full bg-white p-6 rounded shadow mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default ContentContainer;
