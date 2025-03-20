import { useState, useEffect } from "react";
import {FaMicrochip, FaCalculator, FaAtom, FaFileExcel, FaLaptopCode, FaCogs, FaServer,
        FaRobot, FaNetworkWired, FaCog, FaProjectDiagram, FaRulerCombined, FaIndustry, FaExchangeAlt } from "react-icons/fa";

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

  // ✅ Define topics with names and icons
  const topics = [
    { name: "Digital Electronics", icon: <FaMicrochip className="text-blue-500 text-2xl" /> },
    { name: "Electronic Theory", icon: <FaCalculator className="text-green-500 text-2xl" /> },
    { name: "Physics", icon: <FaAtom className="text-purple-500 text-2xl" /> },
    { name: "Excel", icon: <FaFileExcel className="text-green-700 text-2xl" /> },
    { name: "LabVIEW", icon: <FaLaptopCode className="text-yellow-500 text-2xl" /> },
    { name: "PLCs", icon: <FaServer className="text-gray-500 text-2xl" /> }, // Changed from FaCogs
    { name: "Microcontrollers", icon: <FaMicrochip className="text-teal-500 text-2xl" /> }, // Unique color
    { name: "Robotics", icon: <FaRobot className="text-red-500 text-2xl" /> }, // Changed from FaCogs
    { name: "DAQ", icon: <FaNetworkWired className="text-pink-500 text-2xl" /> },
    { name: "Automation", icon: <FaCog className="text-gray-500 text-2xl" /> }, // Changed from FaCogs
    { name: "Co-Ops", icon: <FaProjectDiagram className="text-blue-700 text-2xl" /> },
    { name: "Mathematics", icon: <FaRulerCombined className="text-indigo-500 text-2xl" /> },
    { name: "Process Improvement", icon: <FaIndustry className="text-gray-700 text-2xl" /> },
    { name: "Motion Control", icon: <FaExchangeAlt className="text-orange-500 text-2xl" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Banner with Background Image */}
      <header
        className="w-full h-40 flex items-center justify-center text-white text-3xl font-bold shadow-md relative"
        style={{
          backgroundImage: "url('/images/home/banner_home.jpg')", // Ensure this file is in public/images/home/
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div> {/* Dark Overlay */}
        <span className="relative z-10">Welcome to Smart Systems Technologies</span>
      </header>

      {/* Utility Bar (Breadcrumbs Placeholder) */}
      <nav className="bg-gray-200 py-3 px-6 text-gray-700 text-sm shadow-sm">
        Home
      </nav>

      {/* Main Content Wrapper */}
      <div className="w-full flex justify-center p-8">
        <div className="w-full max-w-none flex flex-wrap justify-center gap-6 px-6">
          {/* User Dashboard Placeholder */}
          <aside className="w-full md:w-3/4 lg:w-4/5 bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2>
            <p className="text-gray-600">Track your learning journey here.</p>
          </aside>

          {/* Topics Index */}
          <main className="w-full md:w-3/4 lg:w-4/5 bg-white shadow-md p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.map((topic, index) => (
                <div key={index} className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg text-center font-medium 
                text-gray-700 shadow border border-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer">
                  {topic.icon} <span>{topic.name}</span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Footer (Fixed to Bottom) */}
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
