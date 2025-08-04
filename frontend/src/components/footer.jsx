// src/components/footer.jsx
import React from 'react';

const Footer = () => (
  <footer className="bg-gray-200 text-center text-sm text-gray-600 py-4 mt-auto">
    &copy; {new Date().getFullYear()} Smart Systems Technologies.
    <a
      href="https://www.flcc.edu/academics/programs/smart-systems-technologies-aas/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline ml-1"
    >
      Learn more
    </a>
  </footer>
);

export default Footer;
