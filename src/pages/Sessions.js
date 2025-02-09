import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3498db");
  const [students, setStudents] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Backend API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://192.168.103.55:8000/invitations/";

  // ✅ Email Validation Function
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ✅ Create Study Session
  const addSession = async () => {
    if (!sessionName || !description || !students) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    const participantEmails = students.split(",").map((email) => email.trim());

    // ✅ Validate Emails
    if (!participantEmails.every(isValidEmail)) {
      alert("⚠️ Please enter valid email addresses.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(API_URL, {
        name: sessionName,
        description,
        color,
        participants: participantEmails,
      });

      setSessions([...sessions, response.data]);
      setSessionName("");
      setDescription("");
      setColor("#3498db");
      setStudents("");
      setIsModalOpen(false);
      alert("✅ Session created successfully!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(`❌ Error: ${error.response?.data?.message || "Failed to create session."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">SESSIONS</h2>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="p-6 rounded-lg shadow-lg flex flex-col justify-between"
               style={{ backgroundColor: session.color }}>
            <h3 className="text-xl font-bold">{session.name}</h3>
            <div className="flex items-center space-x-2 mt-4">
              <div className="bg-white p-2 rounded-full shadow-md">👤</div>
              <span className="text-gray-700">10+</span>
            </div>
            <button onClick={() => navigate(`/modules/${session.id}`)}
                    className="bg-red-500 text-white px-4 py-2 mt-4 rounded-lg">
              Continue
            </button>
          </div>
        ))}
      </div>

      {/* Add Session Button */}
      <button onClick={() => setIsModalOpen(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded mt-6">
        New
      </button>

      {/* Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create a New Session</h3>
            <input type="text" placeholder="Session Name" className="border p-2 mb-2 w-full"
                   value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
            <textarea placeholder="Description" className="border p-2 mb-2 w-full"
                      value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="color" value={color} className="mb-2" onChange={(e) => setColor(e.target.value)} />
            <input type="text" placeholder="Add Participants (comma-separated emails)"
                   className="border p-2 mb-2 w-full" value={students}
                   onChange={(e) => setStudents(e.target.value)} />
            <div className="flex justify-end mt-4">
              <button onClick={addSession} className="bg-blue-500 text-white p-2 rounded mr-2"
                      disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </button>
              <button onClick={() => setIsModalOpen(false)}
                      className="bg-red-500 text-white p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
