import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as BsIcons from 'react-icons/bs';
import * as TbIcons from 'react-icons/tb';
import * as HiIcons from 'react-icons/hi';
import * as CgIcons from 'react-icons/cg';

const getIconComponent = (icon) => {
  if (!icon) return null;
  const prefix = icon.slice(0, 2);
  switch (prefix) {
    case 'Bs':
      return BsIcons[icon];
    case 'Tb':
      return TbIcons[icon];
    case 'Hi':
      return HiIcons[icon];
    case 'Cg':
      return CgIcons[icon];
    default:
      return null;
  }
};

const NestedSubtopicCard = ({ id, title, description, parentId, icon, topicId }) => {
  const navigate = useNavigate();
  const IconComponent = getIconComponent(icon);

  const handleClick = () => {
    navigate(`/topics/${topicId}/${parentId}/${id}`);
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
