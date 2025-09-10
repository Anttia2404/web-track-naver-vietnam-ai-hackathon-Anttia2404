import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import DoNowView from './views/DoNowView'
import CalendarView from './views/CalendarView'
import AnalyticsView from './views/AnalyticsView'

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/do-now" replace />} />
          <Route path="/do-now" element={<DoNowView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
