// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
  FaMicrochip, FaCalculator, FaAtom, FaFileExcel, FaLaptopCode, FaServer,
  FaRobot, FaNetworkWired, FaCog, FaProjectDiagram, FaRulerCombined,
  FaIndustry, FaExchangeAlt
} from "react-icons/fa";

const Home = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [grades, setGrades] = useState([]);
  const studentId = localStorage.getItem('student_id'); // Or use context if available

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getFullYear() !== year) {
        setYear(now.getFullYear());
      }
    }, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, [year]);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentId) return;
      try {
        const res = await fetch(`http://localhost:8000/grades/${studentId}`);
        const data = await res.json();
        setGrades(data);
      } catch (err) {
        console.error("Error fetching grades:", err);
      }
    };
    fetchGrades();
  }, []);

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
      {/* ✅ Banner */}
      <header
        className="w-full h-44 flex items-center justify-center text-white text-3xl font-bold shadow-md relative"
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

      {/* ✅ Breadcrumb */}
      <nav className="bg-gray-200 py-3 px-6 text-gray-700 text-sm shadow-sm">Home</nav>

      {/* ✅ Content */}
      <main className="flex-1 w-full px-6 py-8 flex flex-col items-center gap-8">

        {/* ✅ Progress Section */}
        <section className="w-full max-w-none bg-white shadow p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2>
          {grades.length === 0 ? (
            <p className="text-gray-600 mt-2">No assignment scores yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {grades.map((g, i) => (
                <li key={i} className="border rounded p-4 bg-gray-50">
                  <p className="font-bold capitalize">
                    {g.topic_id.replaceAll("_", " ")} → {g.subtopic_id.replaceAll("_", " ")}
                  </p>
                  <p className="text-green-700 font-semibold text-sm">Score: {g.score}%</p>
                  <p className="text-sm text-gray-600 italic mt-1">"{g.feedback}"</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ✅ Topics Grid */}
        <section className="w-full max-w-none bg-white shadow p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <Link
                key={index}
                to={`/topics/${topic.id}`}
                className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg text-center font-medium \
                text-gray-700 shadow border border-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                {topic.icon} <span>{topic.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
