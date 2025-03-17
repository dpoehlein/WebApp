import React from "react";
import { Link } from "react-router-dom";

const topics = [
  { name: "Digital Electronics", path: "/digital-electronics" },
  { name: "Electronic Theory", path: "/electronic-theory" },
  { name: "Physics", path: "/physics" },
  { name: "Excel", path: "/excel" },
  { name: "LabVIEW", path: "/labview" },
  { name: "PLCs", path: "/plcs" },
];

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-screen">
      {/* Hero Section */}
      <section className="hero bg-blue-600 text-white py-12 text-center rounded-lg shadow-md w-full">
        <h1 className="text-4xl font-bold">Welcome to Smart Systems Technologies</h1>
        <p className="text-lg mt-4">An AI-driven learning platform for interactive practice, tutorials, and assessments.</p>
      </section>
      
      {/* Main Content Area - Expands to Push Footer Down */}
      <div className="flex-grow flex flex-wrap justify-center gap-4 mt-8 px-4 w-full">
        {topics.map((topic) => (
          <Link to={topic.path} key={topic.name} className="topic-card px-6 py-3 text-lg font-semibold border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition duration-300">
            {topic.name}
          </Link>
        ))}
      </div>

      {/* Footer - Now Uses Relative Positioning */}
      <footer className="footer mt-auto py-6 bg-gray-100 text-center shadow-md w-full">
        <p>
          <a href="https://www.flcc.edu/academics/programs/smart-systems-technologies-aas/" 
             target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Visit FLCC Smart Systems Technologies
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
