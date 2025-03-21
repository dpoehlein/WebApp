// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TopicPage from './pages/topics/TopicPage';
import NumberSystems from './pages/topics/digital_electronics/number_systems'; // Subtopic route

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* Home Page — shows all topic cards */}
        <Route path="/" element={<Home />} />

        {/* Topic-Level Page (e.g., /topics/digital_electronics) */}
        <Route path="/topics/:topicId" element={<TopicPage />} />

        {/* Subtopic: Number Systems under Digital Electronics */}
        <Route
          path="/topics/digital_electronics/number_systems"
          element={<NumberSystems />}
        />

        {/* 404 Fallback for unmatched routes */}
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
