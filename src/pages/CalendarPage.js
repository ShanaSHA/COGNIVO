import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([
    { date: "2025-02-10", name: "Math Homework", description: "Complete algebra", priority: "High" },
    { date: "2025-02-12", name: "Science Project", description: "Work on physics model", priority: "Medium" },
  ]);
  const [newTask, setNewTask] = useState({ name: "", description: "", priority: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedDate = selectedDate.toISOString().split("T")[0];

  const handleAddTask = () => {
    if (newTask.name && newTask.description && newTask.priority) {
      setTasks([...tasks, { date: formattedDate, ...newTask }]);
      setNewTask({ name: "", description: "", priority: "" });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Study Calendar</h2>
      <div className="flex flex-col items-center">
        <Calendar onChange={setSelectedDate} value={selectedDate} className="mb-4 border rounded shadow-lg" />
      </div>

      <div className="mt-4 w-full max-w-lg">
        <h3 className="text-xl font-bold">Tasks for {formattedDate}</h3>
        {tasks.filter(task => task.date === formattedDate).length > 0 ? (
          tasks.filter(task => task.date === formattedDate).map((task, index) => (
            <div key={index} className="p-4 border rounded mb-2 shadow">
              <h4 className="text-lg font-bold">{task.name}</h4>
              <p>{task.description}</p>
              <p className="text-sm text-gray-600">Priority: {task.priority}</p>
            </div>
          ))
        ) : (
          <p>No tasks for this date.</p>
        )}
      </div>

      <button
        className="bg-blue-500 text-white p-2 mt-4 rounded shadow"
        onClick={() => setIsModalOpen(true)}
      >
        Add Task
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Add Task for {formattedDate}</h3>
            <input
              type="text"
              placeholder="Task Name"
              className="border p-2 w-full mb-2"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Task Description"
              className="border p-2 w-full mb-2"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <select
              className="border p-2 w-full mb-2"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <div className="flex justify-between">
              <button
                className="bg-gray-400 text-white p-2 rounded w-1/2 mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white p-2 rounded w-1/2"
                onClick={handleAddTask}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
