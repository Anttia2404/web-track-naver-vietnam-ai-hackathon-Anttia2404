// src/components/AnimatedRoutes.tsx
import React, { useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import DoNowView from "../views/DoNowView";
import CalendarView from "../views/CalendarView";
import AnalyticsView from "../views/AnalyticsView";

const routesOrder: Record<string, number> = {
  "/do-now": 0,
  "/calendar": 1,
  "/analytics": 2,
};

const variants = {
  initial: (dir: number) => ({
    x: dir > 0 ? 100 : -100,
    opacity: 0,
    position: "absolute" as const, // ✅ giữ layout, chồng lên
    width: "100%",
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
    position: "absolute" as const,
    width: "100%",
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.4 },
    position: "absolute" as const,
    width: "100%",
  }),
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const prevIndex = useRef(routesOrder[location.pathname] ?? 0);

  const currentIndex = routesOrder[location.pathname] ?? 0;
  const direction = currentIndex > prevIndex.current ? 1 : -1;

  console.log("Prev:", prevIndex.current, "Current:", currentIndex, "Dir:", direction);
  prevIndex.current = currentIndex;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <AnimatePresence mode="wait" custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/do-now" replace />} />

          <Route
            path="/do-now"
            element={
              <motion.div
                variants={variants}
                custom={direction}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DoNowView />
              </motion.div>
            }
          />

          <Route
            path="/calendar"
            element={
              <motion.div
                variants={variants}
                custom={direction}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CalendarView />
              </motion.div>
            }
          />

          <Route
            path="/analytics"
            element={
              <motion.div
                variants={variants}
                custom={direction}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AnalyticsView />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
