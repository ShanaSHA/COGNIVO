import { useState } from "react";

const Dashboard = () => {
  const [timetable, setTimetable] = useState([
    { day: "Monday", subject: "Math", time: "10:00 AM - 11:30 AM" },
    { day: "Tuesday", subject: "Science", time: "2:00 PM - 3:30 PM" },
   
  ]);

  const [newEntry, setNewEntry] = useState({ day: "", subject: "", time: "" });

  const handleAddEntry = () => {
    if (newEntry.day && newEntry.subject && newEntry.time) {
      setTimetable([...timetable, newEntry]);
      setNewEntry({ day: "", subject: "", time: "" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">DASHBOARD</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {/* Cards */}
        <div className="bg-blue-200 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Total Sessions</h2>
        </div>
        <div className="bg-purple-200 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Upcoming Task</h2>
        </div>
        <div className="bg-red-200 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">New Message</h2>
        </div>
        <div className="bg-green-200 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Completed Tasks</h2>
        </div>
      </div>

      {/* Timetable Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Study Timetable</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2 text-left">Day</th>
                <th className="border border-gray-400 px-4 py-2 text-left">Subject</th>
                <th className="border border-gray-400 px-4 py-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-400 px-4 py-2">{entry.day}</td>
                  <td className="border border-gray-400 px-4 py-2">{entry.subject}</td>
                  <td className="border border-gray-400 px-4 py-2">{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Timetable Entry */}
      <div className="mt-6 p-4 border rounded-lg shadow-lg max-w-lg mx-auto">
        <h3 className="text-lg font-bold mb-2">Add New Timetable Entry</h3>
        <select
          className="border p-2 w-full mb-2"
          value={newEntry.day}
          onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
        >
          <option value="">Select Day</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        <input
          type="text"
          placeholder="Subject"
          className="border p-2 w-full mb-2"
          value={newEntry.subject}
          onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
        />
        <input
          type="text"
          placeholder="Time (e.g. 10:00 AM - 11:30 AM)"
          className="border p-2 w-full mb-2"
          value={newEntry.time}
          onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
        />
        <button
          className="bg-blue-500 text-white p-2 w-full rounded"
          onClick={handleAddEntry}
        >
          Add Entry
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
