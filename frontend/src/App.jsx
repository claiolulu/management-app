import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Homepage from './components/Homepage';
import AssignTaskPage from './components/AssignTaskPage';
import TaskDetail from './components/TaskDetail';
import DateTasksPage from './components/DateTasksPage';
import HistoryPage from './components/HistoryPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Check if we're on a reset password URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setCurrentPage('resetPassword');
    }
  }, []);

  // Check for reset password token on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setCurrentPage('resetPassword');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('homepage');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleNavigateToTask = (taskId) => {
    setSelectedTaskId(taskId);
    setCurrentPage('taskDetail');
  };

  const handleNavigateToDate = (date) => {
    setSelectedDate(date);
    setCurrentPage('dateTasks');
  };

  const handleNavigateToHistory = () => {
    setCurrentPage('history');
  };

  const handleBackToHomepage = () => {
    setSelectedTaskId(null);
    setSelectedDate(null);
    setCurrentPage('homepage');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'resetPassword':
        return <ResetPasswordPage onBackToLogin={() => setCurrentPage('login')} />;
      case 'homepage':
        return (
          <Homepage 
            user={user} 
            onLogout={handleLogout} 
            onOpenAssignTask={() => setCurrentPage('assignTask')}
            onNavigateToTask={handleNavigateToTask}
            onNavigateToDate={handleNavigateToDate}
            onNavigateToHistory={handleNavigateToHistory}
          />
        );
      case 'assignTask':
        return (
          <AssignTaskPage
            onCancel={() => setCurrentPage('homepage')}
            onSubmitted={() => setCurrentPage('homepage')}
          />
        );
      case 'taskDetail':
        return (
          <TaskDetail
            taskId={selectedTaskId}
            onBack={handleBackToHomepage}
            user={user}
          />
        );
      case 'dateTasks':
        return (
          <DateTasksPage
            selectedDate={selectedDate}
            onBack={handleBackToHomepage}
            user={user}
            onNavigateToTask={handleNavigateToTask}
            onNavigateToDate={handleNavigateToDate}
          />
        );
      case 'history':
        return (
          <HistoryPage
            onBack={handleBackToHomepage}
            user={user}
            onNavigateToTask={handleNavigateToTask}
          />
        );
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;