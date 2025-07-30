import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import StudentDashboardModal from "../components/admin/StudentDashboardModal";

const AdminPanel = () => {
  const navigate = useNavigate();

  if (localStorage.getItem('admin_authenticated') !== 'true') {
    return <Navigate to='/admin-login' />;
  }

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    email: ''
  });
  const [error, setError] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeStudentModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:8000/students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError("Failed to load students.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async () => {
    if (!newStudent.user_id || !newStudent.first_name || !newStudent.last_name || !newStudent.email) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = { ...newStudent, allowed: true };
    console.log("🟦 Submitting student:", payload);

    try {
      const res = await fetch("http://localhost:8000/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("🟩 Server response:", result);

      if (!res.ok) throw new Error("Add failed");

      await fetchStudents();
      setNewStudent({ user_id: '', first_name: '', last_name: '', email: '' });
      setError(null);
    } catch (err) {
      console.error("❌ Failed to add student:", err);
      setError("Failed to add student.");
    }
  };

  const handleDelete = async (user_id) => {
    try {
      const res = await fetch(`http://localhost:8000/students/${user_id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error();
      await fetchStudents();
    } catch {
      setError("Delete failed.");
    }
  };

  const toggleAllowed = async (student) => {
    try {
      const updated = { ...student, allowed: !student.allowed };
      const res = await fetch(`http://localhost:8000/students/${student.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      await fetchStudents();
    } catch {
      setError("Toggle failed.");
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto p-6">
        {/* Return to Home Button */}
        <div className="mb-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-4 rounded"
          >
            ⬅ Return to Home Page
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel - Manage Students</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Add New Student */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add New Student</h2>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="User ID"
              value={newStudent.user_id}
              onChange={(e) => setNewStudent({ ...newStudent, user_id: e.target.value })}
              className="border px-2 py-1 rounded min-w-[140px]"
            />
            <input
              type="text"
              placeholder="First Name"
              value={newStudent.first_name}
              onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
              className="border px-2 py-1 rounded min-w-[140px]"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newStudent.last_name}
              onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
              className="border px-2 py-1 rounded min-w-[140px]"
            />
            <input
              type="email"
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="border px-2 py-1 rounded min-w-[180px]"
            />
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Current Students Table */}
        <h2 className="text-xl font-semibold mb-3">Current Students</h2>
        <table className="w-full text-sm table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Actions</th>
              <th className="border px-2 py-1">Allowed</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{s.user_id}</td>
                <td className="border px-2 py-1">{s.first_name} {s.last_name}</td>
                <td className="border px-2 py-1">{s.email}</td>
                <td className="border px-2 py-1 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openStudentModal(s)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      View Progress
                    </button>
                    <button
                      onClick={() => handleDelete(s.user_id)}
                      className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => toggleAllowed(s)}
                    className={`px-2 py-1 rounded ${s.allowed ? "bg-green-500" : "bg-red-500"} text-white`}
                  >
                    {s.allowed ? "Yes" : "No"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Dashboard Modal */}
      <StudentDashboardModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={closeStudentModal}
      />
    </>
  );
};

export default AdminPanel;
