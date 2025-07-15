import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TopicPage from './pages/topics/TopicPage';
import SubtopicPage from './pages/topics/SubtopicPage';
import NestedSubtopicPage from './pages/topics/NestedSubtopicPage';

// ✅ Custom routes
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import AssignmentPage from './components/digital_electronics/number_systems/AssignmentPage/AssignmentPage';

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics/:topicId" element={<TopicPage />} />
        <Route path="/topics/:topicId/:subtopicId" element={<SubtopicPage />} />
        <Route
          path="/topics/:topicId/:subtopicId/:nestedSubtopicId"
          element={<NestedSubtopicPage />}
        />

        {/* ✅ Admin Panel route */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* ✅ Dashboard route */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ New assignment route */}
        <Route
          path="/assignments/number_systems"
          element={<AssignmentPage />}
        />

        {/* ✅ Catch-all 404 route */}
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
