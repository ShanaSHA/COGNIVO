import { useState, useEffect } from "react";

const FocusTimer = () => {
  const [time, setTime] = useState(1500); // Default: 25 min
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => setTime(time - 1), 1000);
    } else if (time === 0) {
      alert("Focus session completed! 🎉");
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="p-4 border rounded shadow-md text-center">
      <h2 className="text-xl font-bold mb-2">Focus Timer</h2>
      <p className="text-2xl font-bold">{formatTime()}</p>
      <button className="bg-blue-500 text-white p-2 mt-2 rounded" onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Start"}
      </button>
      <button className="bg-red-500 text-white p-2 mt-2 ml-2 rounded" onClick={() => setTime(1500)}>
        Reset
      </button>
    </div>
  );
};

export default FocusTimer;
