import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-black p-4 text-white flex justify-between">
      <h1 className="text-xl font-bold">Study Planner</h1>
      <div>
        <Link to="/dashboard" className="mr-4">Dashboard</Link>
        <Link to="/sessions" className="mr-4">Sessions</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/" className="px-4">LogOut</Link>
      </div>
    </nav>
  );
};

export default Navbar;
