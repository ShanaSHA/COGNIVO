import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post("http://192.168.103.55:8000/login/", formData);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="bg-gray-100 p-10 rounded-2xl shadow-md w-[450px] flex flex-col items-center">
        <h2 className="bg-yellow-400 text-black px-6 py-2 rounded-md text-lg font-semibold shadow-md mb-6">
          Login
        </h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            className="border border-gray-300 p-3 w-full rounded mb-4"
            type="email"
            placeholder="username"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            className="border border-gray-300 p-3 w-full rounded mb-4"
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-md w-full shadow-md">
            Submit
          </button>
        </form>
        
        {/* Signup Link */}
        <p className="mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
