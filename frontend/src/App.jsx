// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TopicPage from './pages/topics/TopicPage';
import SubtopicPage from "./pages/topics/SubtopicPage";
import NumberSystemsPage from './pages/topics/digital_electronics/subtopics/number_systems/number_systems';
import NestedSubtopicPage from "./pages/topics/NestedSubtopicPage";



function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* Home Page — shows all topic cards */}
        <Route path="/" element={<Home />} />

        {/* Topic-Level Page (e.g., /topics/digital_electronics) */}
        <Route path="/topics/:topicId" element={<TopicPage />} />

        {/* Subtopic Page — dynamic route for ALL subtopics */}
        <Route path="/topics/digital_electronics/number_systems" element={<NumberSystemsPage />} />

        <Route path="/topics/:topicId/:subtopicId/:nestedSubtopicId" element={<NestedSubtopicPage />} />

        {/* Fallback for all other subtopics */}
        <Route path="/topics/:topicId/:subtopicId" element={<SubtopicPage />} />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="p-8 text-red-600 text-xl font-semibold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
