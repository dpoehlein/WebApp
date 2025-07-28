import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Main pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

// Topic structure
import TopicPage from './pages/topics/TopicPage';
import SubtopicPage from './pages/topics/SubtopicPage';
import NestedSubtopicPage from './pages/topics/NestedSubtopicPage';

// Admin
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

// Assignments (hardcoded path for number_systems)
import AssignmentPage from './components/digital_electronics/number_systems/AssignmentPage/AssignmentPage';

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* ✅ Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Topic and Subtopic Routing */}
        <Route path="/topics/:topicId" element={<TopicPage />} />
        <Route path="/topics/:topicId/:subtopicId" element={<SubtopicPage />} />
        <Route path="/topics/:topicId/:subtopicId/:nestedSubtopicId" element={<NestedSubtopicPage />} />

        {/* ✅ Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* ✅ Assignment Page */}
        <Route path="/assignments/number_systems" element={<AssignmentPage />} />

        {/* ✅ Catch-All 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center p-8 text-red-600 text-xl font-semibold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
