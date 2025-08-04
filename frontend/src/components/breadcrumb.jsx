// src/components/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ paths }) => {
  return (
    <nav className="bg-gray-200 py-3 px-6 text-gray-700 text-sm shadow-sm">
      {paths.map((item, idx) => (
        <span key={idx}>
          {item.to ? (
            <Link to={item.to} className="hover:underline text-blue-600">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {idx < paths.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;