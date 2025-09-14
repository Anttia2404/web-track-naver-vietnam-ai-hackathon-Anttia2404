// src/App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AnimatedRoutes from "./components/AnimatedRoutes";
import useTaskNotifications from "./hooks/useTaskNotifications";

const App: React.FC = () => {
  // 🔔 Hook notification toàn cục, chạy ngay khi app mount
  useTaskNotifications();

  return (
    <Router>
      <Navbar />
      <div style={{ padding: 20 }}>
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
