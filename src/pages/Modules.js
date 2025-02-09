import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chat from "../components/Chat";

const Modules = () => {
  const { sessionId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Timer State
  const [time, setTime] = useState(3600); // 1 hour in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Fetch tasks from API
  useEffect(() => {
    axios.get("http://192.168.103.55:8000/tasks/")
      .then(response => setTasks(response.data))
      .catch(error => console.error("Error fetching tasks:", error));
  }, []);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Add Task
  const addTask = async () => {
    if (taskName.trim() === "") return;

    const formData = new FormData();
    formData.append("name", taskName);
    formData.append("description", description);
    formData.append("priority", priority);
    if (uploadedFile) formData.append("file", uploadedFile);

    try {
      const response = await axios.post("http://192.168.103.55:8000/tasks/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTasks([...tasks, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://192.168.103.55:8000/tasks/${taskId}/`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  // Close Modal & Reset Fields
  const handleCloseModal = () => {
    setTaskName("");
    setDescription("");
    setPriority("Medium");
    setUploadedFile(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      {/* Modules Section */}
      <div className="flex-1 bg-gray-100 p-4 rounded-lg border shadow-md">
        <h2 className="text-lg font-bold mb-3">MODULES/TASKS</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center border-b py-2">
              <span>{task.name} ({task.priority})</span>
              <div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Timer & Chat Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-100 p-4 rounded-lg border shadow-md text-center">
          <h2 className="text-2xl font-bold mb-2">{formatTime(time)}</h2>
          <div className="flex justify-center gap-2">
            <button onClick={() => setIsRunning(!isRunning)} className="bg-yellow-300 px-4 py-2 rounded-lg">
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setTime(3600); setIsRunning(false); }} className="bg-yellow-300 px-4 py-2 rounded-lg">
              Reset
            </button>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
          <Chat />
        </div>
      </div>

      {/* New Task Button */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-300 px-6 py-2 rounded-lg"
      >
        New
      </button>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">New Task</h3>
            <input 
              type="text" 
              placeholder="Task Name" 
              className="border p-2 w-full mb-2" 
              value={taskName} 
              onChange={(e) => setTaskName(e.target.value)} 
            />
            <textarea 
              placeholder="Description" 
              className="border p-2 w-full mb-2" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <select 
              className="border p-2 w-full mb-4" 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input type="file" onChange={handleFileUpload} className="border p-2 w-full mb-4" />
            <div className="flex justify-end">
              <button onClick={handleCloseModal} className="bg-gray-500 text-white p-2 rounded mr-2">
                Cancel
              </button>
              <button onClick={addTask} className="bg-blue-500 text-white p-2 rounded">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;
