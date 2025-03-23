// src/components/ContentContainer.jsx
import React from "react";

const ContentContainer = ({ children }) => {
  return (
    <div className="w-full max-w-[1800px] bg-white p-6 rounded shadow mx-auto">
      {children}
    </div>
  );
};

export default ContentContainer;
