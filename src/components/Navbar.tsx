import { NavLink } from "react-router-dom";
import { useTasks } from "../context/TasksContext";
import { useState, useRef, useEffect } from "react";
import logo from "../assets/hackathon-graphic.svg";
import "../index.css";

export default function Navbar() {
  const { tasks } = useTasks();
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState<boolean>(() => {
  return localStorage.getItem("notificationsCleared") === "true";
  });
  const notifRef = useRef<HTMLDivElement>(null);

  const now = new Date().getTime();

  const overdueTasks = tasks.filter(
    (t) =>
      t.officialDeadline &&
      !t.done &&
      new Date(t.officialDeadline).getTime() < now
  );

  const dueNowTasks = tasks.filter(
    (t) =>
      t.realDeadline &&
      !t.done &&
      new Date(t.realDeadline).getTime() <= now
  );

  const totalAlerts = cleared ? 0 : overdueTasks.length + dueNowTasks.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAll = () => {
  setCleared(true);
  localStorage.setItem("notificationsCleared", "true"); 
  setOpen(false);
  };

  return (
    <nav className="navbar">
      <img src = {logo} className="navbar-logo-img"></img>
      <div className="navbar-logo">Student Time Manager</div>
      
      <div className="navbar-links">
        <NavLink
          to="/do-now"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Do Now
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Calendar
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Analytics
        </NavLink>
        <div
          className="nav-link notification"
          onClick={() => setOpen((prev) => !prev)}
          ref={notifRef}
        >
          Notifications
          {totalAlerts > 0 && <span className="badge">{totalAlerts}</span>}

          {open && (
            <div className="dropdown">
              {totalAlerts === 0 && (
                <div className="dropdown-item">No alerts 🎉</div>
              )}

              {!cleared && (
                <>
                  {overdueTasks.length > 0 && (
                    <>
                      <div className="dropdown-header">Overdue</div>
                      {overdueTasks.map((t) => (
                        <div key={t.id} className="dropdown-item overdue">
                          {t.title} (deadline:{" "}
                          {new Date(t.officialDeadline!).toLocaleString()})
                        </div>
                      ))}
                    </>
                  )}

                  {dueNowTasks.length > 0 && (
                    <>
                      <div className="dropdown-header">Due Now</div>
                      {dueNowTasks.map((t) => (
                        <div key={t.id} className="dropdown-item due-now">
                          {t.title} (start by:{" "}
                          {new Date(t.realDeadline!).toLocaleString()})
                        </div>
                      ))}
                    </>
                  )}
                  {totalAlerts > 0 && (
                    <button className="clear-btn" onClick={clearAll}>
                      Clear all
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
