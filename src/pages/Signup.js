import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post("http://192.168.103.55:8000/register/", formData);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error("Signup error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-gray-50 p-8 rounded-lg shadow-lg w-96 border border-gray-300">
        {/* "Sign Up" heading */}
        <h2 className="text-lg font-semibold text-center text-gray-700 mb-4 bg-gradient-to-b from-yellow-400 to-yellow-500 p-2 rounded-md shadow">
          Sign Up
        </h2>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <input
            className="border border-gray-400 p-2 w-full mb-2 rounded-md"
            type="text"
            placeholder="Full name"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            className="border border-gray-400 p-2 w-full mb-2 rounded-md"
            type="email"
            placeholder="Email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            className="border border-gray-400 p-2 w-full mb-4 rounded-md"
            type="password"
            placeholder="Password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
           <button
            type="submit"
            className="bg-red-500 text-white py-0.5 px-2 rounded-md text-md font-semibold w-full shadow-md"
          >
            Submit
          </button>
        </form>

        {/* Navigate to Login */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;