import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as BsIcons from 'react-icons/bs';

const NestedSubtopicCard = ({ id, title, description, parentId, icon, topicId }) => {
  const navigate = useNavigate();
  const IconComponent = icon ? BsIcons[icon] : null;

  const handleClick = () => {
    navigate(`/topics/${topicId}/${parentId}/${id}`); // ✅ Corrected path
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white shadow-md rounded-2xl p-5 transition-transform hover:shadow-lg hover:scale-[1.02] border border-gray-200 flex flex-col items-start"
    >
      {IconComponent && <IconComponent className="text-3xl text-blue-600 mb-3" />}
      <h4 className="text-lg font-semibold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-auto">
        Explore
      </button>
    </div>
  );
};

export default NestedSubtopicCard;
