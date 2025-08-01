import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = "sstadmin"; // 🔐 TODO: Move to server-side validation in production

    if (password === correctPassword) {
      localStorage.setItem("admin_authenticated", "true");
      navigate("/admin");
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Return Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-4 rounded"
        >
          ⬅ Return to Home Page
        </button>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full p-6 bg-white shadow rounded border">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {error && <div className="text-red-600 mb-3 text-sm text-center">{error}</div>}

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
    </div>
  );
};

export default AdminLogin;
