import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';

const HistoryPage = ({ onBack, user, onNavigateToTask }) => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchHistoryTasks(0, false);
  }, []);

  const fetchHistoryTasks = async (pageToLoad = 0, append = false) => {
    if (loading && append) return;
    
    if (!append) setInitialLoading(true);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/tasks/history?page=${pageToLoad}&size=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newTasks = data.items || [];
        
        if (append) {
          setTasks(prev => [...prev, ...newTasks]);
        } else {
          setTasks(newTasks);
        }
        
        setPage(data.page);
        setHasMore((data.page + 1) < data.totalPages);
      } else {
        console.error('Failed to fetch history tasks');
        if (!append) {
          setTasks([]);
        }
      }
    } catch (error) {
      console.error('Error fetching history tasks:', error);
      if (!append) {
        setTasks([]);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const loadMoreTasks = () => {
    if (hasMore && !loading) {
      fetchHistoryTasks(page + 1, true);
    }
  };

  const formatDate = (dateString) => {
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
            <span className="task-date">{formatDate(task.date)}</span>
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

  if (initialLoading) {
    return (
      <div className="history-container">
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Header */}
      <div className="history-header">
        <button onClick={onBack} className="back-button" title="Go Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="history-title">Task History</h1>
        
        <div className="header-spacer"></div>
      </div>

      {/* Content */}
      <div className="history-content">
        {tasks.length === 0 ? (
          <div className="no-tasks-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="no-tasks-icon">
              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No task history found</p>
            <span>Completed and past tasks will appear here</span>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onNavigateToTask}
              />
            ))}
            {hasMore && (
              <div className="load-more-row">
                <button 
                  className="load-more-button" 
                  onClick={loadMoreTasks} 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
