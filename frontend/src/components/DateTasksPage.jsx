import React, { useState, useEffect } from 'react';
import '../styles/DateTasksPage.css';
import config from '../config/api';

const DateTasksPage = ({ selectedDate, onBack, user, onNavigateToTask, onNavigateToDate }) => {
  const [userTasks, setUserTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [userTasksPage, setUserTasksPage] = useState(0);
  const [otherTasksPage, setOtherTasksPage] = useState(0);
  const [userTasksHasMore, setUserTasksHasMore] = useState(true);
  const [otherTasksHasMore, setOtherTasksHasMore] = useState(true);
  const [userTasksLoading, setUserTasksLoading] = useState(false);
  const [otherTasksLoading, setOtherTasksLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  useEffect(() => {
    if (selectedDate) {
      fetchTasksForDate();
    }
  }, [selectedDate]);

  const fetchTasksForDate = async (userPage = 0, otherPage = 0, append = false) => {
    if (!append) setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${config.API_BASE_URL}/tasks/by-date-detailed?date=${selectedDate}&userTasksPage=${userPage}&otherTasksPage=${otherPage}&size=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (append) {
          if (userPage > userTasksPage) {
            setUserTasks(prev => [...prev, ...data.userTasks.items]);
          }
          if (otherPage > otherTasksPage) {
            setOtherTasks(prev => [...prev, ...data.otherTasks.items]);
          }
        } else {
          setUserTasks(data.userTasks.items || []);
          setOtherTasks(data.otherTasks.items || []);
        }

        setUserTasksPage(data.userTasks.page);
        setOtherTasksPage(data.otherTasks.page);
        setUserTasksHasMore(data.userTasks.hasMore);
        setOtherTasksHasMore(data.otherTasks.hasMore);
      } else {
        console.error('Failed to fetch tasks for date');
        // Set empty arrays if request fails
        if (!append) {
          setUserTasks([]);
          setOtherTasks([]);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks for date:', error);
      // Set empty arrays if request fails
      if (!append) {
        setUserTasks([]);
        setOtherTasks([]);
      }
    } finally {
      setLoading(false);
      setUserTasksLoading(false);
      setOtherTasksLoading(false);
    }
  };

  const loadMoreUserTasks = async () => {
    if (userTasksLoading || !userTasksHasMore) return;
    setUserTasksLoading(true);
    await fetchTasksForDate(userTasksPage + 1, otherTasksPage, true);
  };

  const loadMoreOtherTasks = async () => {
    if (otherTasksLoading || !otherTasksHasMore) return;
    setOtherTasksLoading(true);
    await fetchTasksForDate(userTasksPage, otherTasksPage + 1, true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateToDate = (direction) => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    
    const newDateString = newDate.toISOString().split('T')[0];
    onNavigateToDate && onNavigateToDate(newDateString);
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    const p = (priority || '').toString().toLowerCase();
    switch (p) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getStatusColor = (status) => {
    const s = (status || '').toString().toLowerCase().replace('_', '-');
    switch (s) {
      case 'completed': return '#2ed573';
      case 'in-progress': return '#3742fa';
      case 'pending': return '#ffa502';
      case 'scheduled': return '#5f27cd';
      default: return '#747d8c';
    }
  };

  const TaskCard = ({ task, onClick }) => (
    <div 
      className="task-card clickable"
      onClick={() => onClick && onClick(task.id)}
    >
      <div className="task-header">
        <div className="task-user">
          <div className="task-avatar">
            {task.assignedUser ? task.assignedUser.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="task-user-info">
            <span className="task-username">{task.assignedUser}</span>
            <span className="task-date">{formatDateShort(task.date)}</span>
          </div>
        </div>
        <div className="task-badges">
          <span 
            className="task-priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
          <span 
            className="task-status-badge"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {task.status?.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="task-content">
        <p className="task-description">{task.description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="date-tasks-container">
        <div className="date-tasks-loading">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="date-tasks-container">
      {/* Top Bar */}
      <div className="date-tasks-header">
        <button onClick={onBack} className="back-button" title="Go Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="date-tasks-title">Tasks</h1>
        
        <div className="header-spacer"></div>
      </div>

      {/* Selected Date Display */}
      <div className="selected-date-section">
        <div className="date-navigation">
          <button 
            className="date-nav-button"
            onClick={() => navigateToDate(-1)}
            title="Previous Day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h2 className="selected-date">{formatDate(selectedDate)}</h2>
          
          <button 
            className="date-nav-button"
            onClick={() => navigateToDate(1)}
            title="Next Day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="date-tasks-content">
        {/* Show "no tasks created" message if both sections are empty */}
        {userTasks.length === 0 && otherTasks.length === 0 ? (
          <div className="no-tasks-overall-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="no-tasks-icon">
              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>There's no tasks created on today.</p>
          </div>
        ) : (
          <>
            {/* Section 1: User's Tasks */}
            <section className="tasks-section">
              <div className="section-header">
                <h3 className="section-title">Your Tasks</h3>
                <span className="section-count">({userTasks.length})</span>
              </div>
              
              <div className="tasks-list">
                {userTasks.length === 0 ? (
                  <div className="no-tasks-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="no-tasks-icon">
                      <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>No tasks assigned to you</p>
                    <span>for this date</span>
                  </div>
                ) : (
                  <>
                    {userTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={onNavigateToTask}
                      />
                    ))}
                    {userTasksHasMore && (
                      <div className="load-more-row">
                        <button 
                          className="load-more-button" 
                          onClick={loadMoreUserTasks} 
                          disabled={userTasksLoading}
                        >
                          {userTasksLoading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Section 2: Other Users' Tasks */}
            <section className="tasks-section">
              <div className="section-header">
                <h3 className="section-title">Other Tasks</h3>
                <span className="section-count">({otherTasks.length})</span>
              </div>
              
              <div className="tasks-list">
                {otherTasks.length === 0 ? (
                  <div className="no-tasks-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="no-tasks-icon">
                      <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>No other tasks</p>
                    <span>for this date</span>
                  </div>
                ) : (
                  <>
                    {otherTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={onNavigateToTask}
                      />
                    ))}
                    {otherTasksHasMore && (
                      <div className="load-more-row">
                        <button 
                          className="load-more-button" 
                          onClick={loadMoreOtherTasks} 
                          disabled={otherTasksLoading}
                        >
                          {otherTasksLoading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DateTasksPage;