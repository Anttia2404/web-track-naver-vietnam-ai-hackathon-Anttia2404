import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { TasksProvider } from './context/TasksContext' // sẽ tạo ở Bước 2

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TasksProvider>
      <App />
    </TasksProvider>
  </React.StrictMode>
)
