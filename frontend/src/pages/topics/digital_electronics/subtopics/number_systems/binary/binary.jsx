// src/pages/topics/digital_electronics/subtopics/number_systems/binary/binary.jsx

import React from 'react';
import NestedSubtopicPage from '../../../../NestedSubtopicPage';

const BinaryPage = () => {
  const topicId = 'digital_electronics';
  const subtopicId = 'number_systems';
  const nestedSubtopicId = 'binary';

  return (
    <NestedSubtopicPage
      topicId={topicId}
      subtopicId={subtopicId}
      nestedSubtopicId={nestedSubtopicId}
    />
  );
};

export default BinaryPage;

