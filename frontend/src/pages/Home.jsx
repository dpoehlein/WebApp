// src/pages/Home.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaMicrochip, FaCalculator, FaAtom, FaFileExcel, FaLaptopCode, FaServer,
  FaRobot, FaNetworkWired, FaCog, FaProjectDiagram, FaRulerCombined,
  FaIndustry, FaExchangeAlt
} from "react-icons/fa";

const Home = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getFullYear() !== year) {
        setYear(now.getFullYear());
      }
    }, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, [year]);

  const topics = [
    { name: "Digital Electronics", id: "digital_electronics", icon: <FaMicrochip className="text-blue-500 text-2xl" /> },
    { name: "Electronic Theory", id: "electronic_theory", icon: <FaCalculator className="text-green-500 text-2xl" /> },
    { name: "Physics", id: "physics", icon: <FaAtom className="text-purple-500 text-2xl" /> },
    { name: "Excel", id: "excel", icon: <FaFileExcel className="text-green-700 text-2xl" /> },
    { name: "LabVIEW", id: "labview", icon: <FaLaptopCode className="text-yellow-500 text-2xl" /> },
    { name: "PLCs", id: "plcs", icon: <FaServer className="text-gray-500 text-2xl" /> },
    { name: "Microcontrollers", id: "microcontrollers", icon: <FaMicrochip className="text-teal-500 text-2xl" /> },
    { name: "Robotics", id: "robotics", icon: <FaRobot className="text-red-500 text-2xl" /> },
    { name: "DAQ", id: "daq", icon: <FaNetworkWired className="text-pink-500 text-2xl" /> },
    { name: "Automation", id: "automation", icon: <FaCog className="text-gray-500 text-2xl" /> },
    { name: "Co-Ops", id: "co_ops", icon: <FaProjectDiagram className="text-blue-700 text-2xl" /> },
    { name: "Mathematics", id: "mathematics", icon: <FaRulerCombined className="text-indigo-500 text-2xl" /> },
    { name: "Process Improvement", id: "process_improvement", icon: <FaIndustry className="text-gray-700 text-2xl" /> },
    { name: "Motion Control", id: "motion_control", icon: <FaExchangeAlt className="text-orange-500 text-2xl" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Banner */}
      <header
        className="w-full h-40 flex items-center justify-center text-white text-3xl font-bold shadow-md relative"
        style={{
          backgroundImage: "url('/images/home/banner_home.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <span className="relative z-10">Welcome to Smart Systems Technologies</span>
      </header>

      {/* Breadcrumb Placeholder */}
      <nav className="bg-gray-200 py-3 px-6 text-gray-700 text-sm shadow-sm">Home</nav>

      {/* Main Content */}
      <div className="w-full flex justify-center p-8">
        <div className="w-full max-w-none flex flex-wrap justify-center gap-6 px-6">
          <aside className="w-full md:w-3/4 lg:w-4/5 bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2>
            <p className="text-gray-600">Track your learning journey here.</p>
          </aside>

          <main className="w-full md:w-3/4 lg:w-4/5 bg-white shadow-md p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.map((topic, index) =>
                topic.id ? (
                  <Link
                    key={index}
                    to={`/topics/${topic.id}`}
                    className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg text-center font-medium 
                    text-gray-700 shadow border border-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    {topic.icon} <span>{topic.name}</span>
                  </Link>
                ) : (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg text-center font-medium 
                    text-gray-700 shadow border border-gray-300 opacity-60 cursor-not-allowed"
                  >
                    {topic.icon} <span>{topic.name}</span>
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto shadow-md">
        &copy; {year}{" "}
        <a
          href="https://www.flcc.edu/academics/programs/smart-systems-technologies-aas/"
          className="underline hover:text-gray-400"
        >
          FLCC Smart Systems Technologies
        </a>
      </footer>
    </div>
  );
};

export default Home;
