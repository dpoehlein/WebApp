import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent page refresh
    const correctPassword = "sstadmin"; // TODO: Replace with secure server-side validation

    if (password === correctPassword) {
      localStorage.setItem("admin_authenticated", "true");
      navigate("/admin");
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded border">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
