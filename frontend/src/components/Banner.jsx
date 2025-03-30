// Banner.jsx
import React from 'react';

const Banner = ({ title, background, height = "h-52" }) => {
  return (
    <div
      className={`relative w-full ${height} flex items-center justify-center text-white text-3xl font-bold shadow-md`}
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <h1 className="relative z-10">{title}</h1>
    </div>
  );
};

export default Banner;

