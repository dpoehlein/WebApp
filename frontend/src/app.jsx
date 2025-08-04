import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './app.css'; // ✅ Add this line to apply global/tailwind styles

// Main pages
import Home from './pages/home';
import Dashboard from './pages/dashboard';

// Topic structure
import TopicPage from './pages/topics/topic_page';
import SubtopicPage from './pages/topics/subtopic_page';
import NestedSubtopicPage from './pages/topics/nested_subtopic_page';

// Admin
import AdminLogin from './pages/admin_login';
import AdminPanel from './pages/admin_panel';

// Assignments (hardcoded path for number_systems)
import AssignmentPage from './components/digital_electronics/number_systems/assignment_page/assignment_page';

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
