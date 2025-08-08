import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";
import {
  FaMicrochip,
  FaCalculator,
  FaAtom,
  FaFileExcel,
  FaLaptopCode,
  FaServer,
  FaRobot,
  FaNetworkWired,
  FaCog,
  FaProjectDiagram,
  FaRulerCombined,
  FaIndustry,
  FaExchangeAlt,
} from "react-icons/fa";

const Home = () => {
  const [progressData, setProgressData] = useState([]);
  const student_id = localStorage.getItem("student_id") || "dan123"; // Fallback for dev
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!student_id) return;
      try {
        const res = await fetch(`http://localhost:8000/students/${student_id}`);
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student info:", err);
      }
    };
    fetchStudent();
  }, [student_id]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!student_id) return;
      try {
        const res = await fetch(
          `http://localhost:8000/progress-all/${student_id}`
        );
        const data = await res.json();
        setProgressData(data);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };
    fetchProgress();
  }, [student_id]);

  const getStatus = (entry) => {
    const scores = [entry.quiz_score, entry.ai_score, entry.assignment_score];
    const definedScores = scores.filter((s) => typeof s === "number" && s > 0);
    if (definedScores.length === 3 && definedScores.every((s) => s >= 80))
      return "✅";
    if (definedScores.length > 0) return "🔄";
    return "⏳";
  };

  const formatLabel = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .replace(/(^|_)(\w)/g, (_, __, char) => ` ${char.toUpperCase()}`)
      .trim();
  };

  const nestedSubtopicsBySubtopic = {};
  progressData.forEach((entry) => {
    const key = `${entry.topic_id}/${entry.subtopic_id}`;
    if (!nestedSubtopicsBySubtopic[key]) nestedSubtopicsBySubtopic[key] = [];
    nestedSubtopicsBySubtopic[key].push(entry);
  });

  const topics = [
    {
      name: "Digital Electronics",
      id: "digital_electronics",
      icon: <FaMicrochip className="text-blue-500 text-2xl" />,
    },
    {
      name: "Electronic Theory",
      id: "electronic_theory",
      icon: <FaCalculator className="text-green-500 text-2xl" />,
    },
    {
      name: "Physics",
      id: "physics",
      icon: <FaAtom className="text-purple-500 text-2xl" />,
    },
    {
      name: "Excel",
      id: "excel",
      icon: <FaFileExcel className="text-green-700 text-2xl" />,
    },
    {
      name: "LabVIEW",
      id: "labview",
      icon: <FaLaptopCode className="text-yellow-500 text-2xl" />,
    },
    {
      name: "PLCs",
      id: "plcs",
      icon: <FaServer className="text-gray-500 text-2xl" />,
    },
    {
      name: "Microcontrollers",
      id: "microcontrollers",
      icon: <FaMicrochip className="text-teal-500 text-2xl" />,
    },
    {
      name: "Robotics",
      id: "robotics",
      icon: <FaRobot className="text-red-500 text-2xl" />,
    },
    {
      name: "DAQ",
      id: "daq",
      icon: <FaNetworkWired className="text-pink-500 text-2xl" />,
    },
    {
      name: "Automation",
      id: "automation",
      icon: <FaCog className="text-gray-500 text-2xl" />,
    },
    {
      name: "Co-Ops",
      id: "co_ops",
      icon: <FaProjectDiagram className="text-blue-700 text-2xl" />,
    },
    {
      name: "Mathematics",
      id: "mathematics",
      icon: <FaRulerCombined className="text-indigo-500 text-2xl" />,
    },
    {
      name: "Process Improvement",
      id: "process_improvement",
      icon: <FaIndustry className="text-gray-700 text-2xl" />,
    },
    {
      name: "Motion Control",
      id: "motion_control",
      icon: <FaExchangeAlt className="text-orange-500 text-2xl" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header
        className="w-full h-44 flex items-center justify-center text-white text-6xl font-bold shadow-md relative"
        style={{
          backgroundImage: "url('/images/home/banner_home.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <span className="relative z-10">
          Welcome to Smart Systems Technologies
        </span>
      </header>

      <nav className="bg-gray-200 py-3 px-6 text-gray-700 text-sm shadow-sm flex justify-between items-center">
        <span>Home</span>
        <Link
          to="/admin-login"
          className="text-sm text-blue-600 hover:underline"
        >
          Admin Login
        </Link>
      </nav>

      <main className="flex-1 w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ✅ Dashboard Card */}
          <div className="md:col-span-1 bg-white shadow p-6 rounded-lg h-fit hover:shadow-lg transition">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {student
                  ? `${student.first_name} ${student.last_name}'s Dashboard`
                  : "Dashboard"}
              </h2>
              <Link
                to="/dashboard"
                className="text-sm text-blue-600 hover:underline"
              >
                View Full →
              </Link>
            </div>

            {Object.entries(nestedSubtopicsBySubtopic).length > 0 ? (
              Object.entries(nestedSubtopicsBySubtopic)
                .filter(([key, entries]) => {
                  const [topic, subtopic] = key.split("/");
                  return topic !== "undefined" && subtopic !== "undefined";
                })
                .map(([key, entries], i) => {
                  const [topic, subtopic] = key.split("/");

                  // 🔍 Debug Log
                  console.log("🔎 Subtopic group key:", key);
                  console.log("  ➤ topic:", topic, "subtopic:", subtopic);
                  console.log("  ➤ Entries:", entries);

                  return (
                    <div key={i} className="mb-4">
                      <p className="text-sm font-semibold text-gray-700">
                        {formatLabel(topic)}
                      </p>
                      <p className="text-xs font-medium text-gray-500 ml-2 mb-1">
                        {formatLabel(subtopic)}:
                      </p>
                      <div className="flex flex-wrap gap-2 ml-4">
                        {entries.map((entry) => (
                          <Link
                            key={entry.nested_subtopic_id}
                            to={`/topics/${entry.topic_id}/${entry.subtopic_id}/${entry.nested_subtopic_id}`}
                            className="px-3 py-1 rounded-full text-xs font-semibold border hover:bg-blue-500 hover:text-white transition"
                          >
                            {formatLabel(entry.nested_subtopic)}{" "}
                            {getStatus(entry)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-600">No progress data available.</p>
            )}
          </div>

          <section className="md:col-span-2 bg-white shadow p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topics.map((topic, index) => (
                <Link
                  key={index}
                  to={`/topics/${topic.id}`}
                  className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg text-center font-medium text-gray-700 shadow border border-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  {topic.icon} <span>{topic.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
