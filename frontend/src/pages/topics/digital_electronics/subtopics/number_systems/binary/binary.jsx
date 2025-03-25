// src/pages/topics/digital_electronics/subtopics/number_systems/binary/binary.jsx

import React from 'react';
import NestedSubtopicPage from '../../../NestedSubtopicPage';
import BinaryDemo from '../../../../../../components/digital_electronics/number_systems/BinaryDemo';

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
        <div className="mt-6">
          <BinaryDemo binary="1011" />
        </div>
      )}
    />
  );
};

export default BinaryPage;
