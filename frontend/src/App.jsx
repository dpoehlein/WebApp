import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Main pages
import Home from "./pages/home.jsx";
import Dashboard from "./pages/dashboard.jsx";

// Topic structure
import TopicPage from "./pages/topics/topic_page.jsx";
import SubtopicPage from "./pages/topics/subtopic_page.jsx";
import NestedSubtopicPage from "./pages/topics/nested_subtopic_page.jsx";

// Admin
import AdminLogin from "./pages/admin_login.jsx";
import AdminPanel from "./pages/admin_panel.jsx";

// Assignments (hardcoded path for number_systems)
import AssignmentPage from "./components/digital_electronics/number_systems/assignment_page/assignment_page.jsx";

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* ✅ Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Topic and Subtopic Routing */}
        <Route path="/topics/:topic_id" element={<TopicPage />} />
        <Route
          path="/topics/:topic_id/:subtopic_id"
          element={<SubtopicPage />}
        />
        <Route
          path="/topics/:topic_id/:subtopic_id/:nested_subtopic_id"
          element={<NestedSubtopicPage />}
        />

        {/* ✅ Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* ✅ Assignment Page */}
        <Route
          path="/assignments/number_systems"
          element={<AssignmentPage />}
        />

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
