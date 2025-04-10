import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TopicPage from './pages/topics/TopicPage';
import SubtopicPage from './pages/topics/SubtopicPage';
import NestedSubtopicPage from './pages/topics/NestedSubtopicPage';

// ✅ Custom routes
import BinaryPage from './pages/topics/digital_electronics/subtopics/number_systems/binary/binary';
import AssignmentPage from './components/digital_electronics/number_systems/AssignmentPage/AssignmentPage';

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics/:topicId" element={<TopicPage />} />

        <Route
          path="/topics/digital_electronics/number_systems/binary"
          element={<BinaryPage />}
        />

        <Route
          path="/topics/:topicId/:subtopicId/:nestedSubtopicId"
          element={<NestedSubtopicPage />}
        />

        <Route path="/topics/:topicId/:subtopicId" element={<SubtopicPage />} />

        {/* ✅ New assignment route */}
        <Route
          path="/assignments/number_systems"
          element={<AssignmentPage />}
        />

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
