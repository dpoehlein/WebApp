import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const AdminPanel = () => {
  if (localStorage.getItem('admin_authenticated') !== 'true') {
    return <Navigate to='/admin-login' />;
  }
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ user_id: '', first_name: '', last_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    console.log("📤 Sending student payload:", payload);

    try {
      const res = await fetch("http://localhost:8000/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("🧾 Server response:", res.status, text);

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Manage Students</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Student</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="User ID"
            value={newStudent.user_id}
            onChange={(e) => setNewStudent({ ...newStudent, user_id: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder="First Name"
            value={newStudent.first_name}
            onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newStudent.last_name}
            onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Current Students</h2>
      <table className="w-full text-sm table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">User ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Allowed</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{s.user_id}</td>
              <td className="border px-2 py-1">{s.first_name} {s.last_name}</td>
              <td className="border px-2 py-1">{s.email}</td>
              <td className="border px-2 py-1 text-center">
                <button
                  onClick={() => toggleAllowed(s)}
                  className={`text-xs px-2 py-1 rounded ${s.allowed ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {s.allowed ? "Yes" : "No"}
                </button>
              </td>
              <td className="border px-2 py-1 text-center">
                <button onClick={() => handleDelete(s.user_id)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;