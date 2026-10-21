import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';

// Pages
import DashboardPage from './pages/DashboardPage';
import TaskListPage from './pages/TaskListPage';
import TaskAddPage from './pages/TaskAddPage';
import TaskEditPage from './pages/TaskEditPage';
import TaskViewPage from './pages/TaskViewPage';
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeAddPage from './pages/EmployeeAddPage';
import EmployeeEditPage from './pages/EmployeeEditPage';
import EmployeeViewPage from './pages/EmployeeViewPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<DashboardPage />} />

            {/* Task routes */}
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="/tasks/add" element={<TaskAddPage />} />
            <Route path="/tasks/:id" element={<TaskViewPage />} />
            <Route path="/tasks/:id/edit" element={<TaskEditPage />} />

            {/* Employee routes */}
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/add" element={<EmployeeAddPage />} />
            <Route path="/employees/:id" element={<EmployeeViewPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
