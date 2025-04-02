// src/pages/topics/digital_electronics/subtopics/number_systems/binary/binary.jsx

import React, { useState } from 'react';
import NestedSubtopicPage from '../../../../NestedSubtopicPage';
import BinaryDemo from '../../../../../../components/digital_electronics/number_systems/BinaryDemo';
import BinaryQuizModal from '../../../../../../components/digital_electronics/number_systems/BinaryQuizModal';
import LearningObjectives from '../../../../../../components/LearningObjectives';
import learningObjectives from '../../../../../../data/ai/learningObjectives';

const BinaryPage = () => {
  const topicId = 'digital_electronics';
  const subtopicId = 'number_systems';
  const nestedSubtopicId = 'binary';

  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <NestedSubtopicPage
      topicId={topicId}
      subtopicId={subtopicId}
      nestedSubtopicId={nestedSubtopicId}
      renderCustomContent={() => (
        <div className="mt-6 space-y-6">
          {/* Learning Objectives */}
          <LearningObjectives objectives={learningObjectives.binary} />

          {/* Quiz Button */}
          <div className="text-center">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
              onClick={() => setIsQuizOpen(true)}
            >
              🧠 Take Binary Quiz
            </button>
          </div>

          {/* Visual Demo */}
          <BinaryDemo binary="1011" />

          {/* Quiz Modal */}
          <BinaryQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        </div>
      )}
    />
  );
};

export default BinaryPage;
