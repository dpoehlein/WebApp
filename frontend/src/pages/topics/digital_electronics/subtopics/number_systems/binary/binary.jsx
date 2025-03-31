// src/pages/topics/digital_electronics/subtopics/number_systems/binary/binary.jsx

import React from 'react';
import NestedSubtopicPage from '../../../../NestedSubtopicPage';
import BinaryDemo from '../../../../../../components/digital_electronics/number_systems/BinaryDemo';
import LearningObjectives from '../../../../../../components/LearningObjectives';
import learningObjectives from '../../../../../../data/ai/learningObjectives';

const BinaryPage = () => {
  const topicId = 'digital_electronics';
  const subtopicId = 'number_systems';
  const nestedSubtopicId = 'binary';

  return (
    <NestedSubtopicPage
      topicId={topicId}
      subtopicId={subtopicId}
      nestedSubtopicId={nestedSubtopicId}
      renderCustomContent={() => (
        <div className="mt-6 space-y-6">
          <LearningObjectives objectives={learningObjectives.binary} />
          <BinaryDemo binary="1011" />
        </div>
      )}
    />
  );
};

export default BinaryPage;
