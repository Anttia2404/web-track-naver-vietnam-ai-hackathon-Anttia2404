import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AnimatedRoutes from "./components/AnimatedRoutes";

const App: React.FC = () => {
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
