import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Main pages
import HomePage from "./pages/home";
import Dashboard from "./pages/dashboard";

// Topic structure
import TopicPage from "./pages/topics/topic_page";
import SubtopicPage from "./pages/topics/subtopic_page";
import NestedSubtopicPage from "./pages/topics/nested_subtopic_page";

// Admin
import AdminLogin from "./pages/admin_login";
import AdminPanel from "./pages/admin_panel";

// Assignments (hardcoded path for number_systems)
import AssignmentPage from "./components/digital_electronics/number_systems/assignment_page/assignment_page";

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* ✅ Core Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Topic and Subtopic Routing (snake_case for consistency with MongoDB) */}
        <Route path="/topics/:topic_id" element={<TopicPage />} />
        <Route
          path="/topics/:topic_id/:subtopic_id"
          element={<SubtopicPage />}
        />
        <Route
          path="/topics/:topic_id/:subtopic_id/:nested_subtopic_id"
          element={<NestedSubtopicPage />}
        />

        {/* ✅ Assignment Page (dynamic for all lessons) */}
        <Route
          path="/assignments/:topic_id/:subtopic_id/:nested_subtopic_id"
          element={<AssignmentPage />}
        />

        {/* ✅ Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

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
