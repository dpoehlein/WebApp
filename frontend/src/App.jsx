import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TopicPage from './pages/topics/TopicPage';
import SubtopicPage from './pages/topics/SubtopicPage';
import NestedSubtopicPage from './pages/topics/NestedSubtopicPage';

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* Home Page – lists all major topics */}
        <Route path="/" element={<Home />} />

        {/* Topic-level route (e.g., /topics/digital_electronics) */}
        <Route path="/topics/:topicId" element={<TopicPage />} />

        {/* Nested Subtopic route (e.g., /topics/digital_electronics/number_systems/binary) */}
        <Route path="/topics/:topicId/:subtopicId/:nestedSubtopicId" element={<NestedSubtopicPage />} />

        {/* Subtopic-level route (e.g., /topics/digital_electronics/number_systems) */}
        <Route path="/topics/:topicId/:subtopicId" element={<SubtopicPage />} />

        {/* 404 fallback */}
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
