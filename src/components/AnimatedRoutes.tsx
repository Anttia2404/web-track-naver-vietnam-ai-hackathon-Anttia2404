// src/components/AnimatedRoutes.tsx
import React, { useRef, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";


import DoNowView from "../views/DoNowView";
import CalendarView from "../views/CalendarView";
import AnalyticsView from "../views/AnalyticsView";

// Thứ tự route để tính hướng
const routesOrder: Record<string, number> = {
  "/do-now": 0,
  "/calendar": 1,
  "/analytics": 2,
};

// Variants animation: slide + fade
const variants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    position: "absolute",
    width: "100%",
    height: "100%",
  }),
  animate: {
    x: 0,
    opacity: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    transition: {
      duration: 0.2,
      ease: [0.42, 0, 0.58, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    position: "absolute",
    width: "100%",
    height: "100%",
    transition: {
      duration: 0.2,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const prevIndex = useRef(routesOrder[location.pathname] ?? 0);

  const currentIndex = routesOrder[location.pathname] ?? 0;
  const direction = currentIndex > prevIndex.current ? 1 : -1;

  // Cập nhật prevIndex sau render để AnimatePresence nhận đúng direction
  useEffect(() => {
    prevIndex.current = currentIndex;
  }, [currentIndex]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={location.pathname} // key khác nhau cho mỗi route
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction} // Framer Motion sẽ truyền direction vào variants
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/do-now" replace />} />
            <Route path="/do-now" element={<DoNowView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
