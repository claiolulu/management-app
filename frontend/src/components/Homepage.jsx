import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProfileSettings from './ProfileSettings';
import RoleManagement from './RoleManagement';
import ConfirmDialog from './ConfirmDialog';
import config from '../config/api';
import '../styles/Homepage.css';

const toLocalDateOnly = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const groupByDate = (items) => {
  const map = new Map();
  for (const item of items) {
    const key = (item.date || item.dueDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  // Keep insertion order as we fetch ordered by date asc / created desc
  return Array.from(map.entries()).map(([date, list]) => ({ date, items: list }));
};

const Homepage = ({ user, onLogout, onOpenAssignTask, onNavigateToTask, onNavigateToDate, onNavigateToHistory }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // User tasks paginated list (all tasks assigned to current user)
  const [userTasks, setUserTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  // Others' tasks for managers
  const [otherTasks, setOtherTasks] = useState([]);
  const [otherTasksPage, setOtherTasksPage] = useState(0);
  const [otherTasksHasMore, setOtherTasksHasMore] = useState(true);
  const [otherTasksLoading, setOtherTasksLoading] = useState(false);

  // Calendar highlights
  const [calendarTasks, setCalendarTasks] = useState([]);

  // Date modal for day details
  const [showDateModal, setShowDateModal] = useState(false);
  const [modalDate, setModalDate] = useState(null); // yyyy-mm-dd
  const [modalTasks, setModalTasks] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const calendarRef = useRef(null);
  const profileRef = useRef(null);

  // Determine if current user is manager
  const isManager = currentUser?.isManager || currentUser?.role === 'Manager' || currentUser?.role === 'MANAGER';

  // Backend fetch helpers
  const fetchUserTasks = async (pageToLoad = 0) => {
    if (listLoading) return;
    setListLoading(true);
    
    console.log('=== FETCH USER TASKS ===');
    console.log('Current user:', currentUser);
    console.log('Is manager:', isManager);
    console.log('Page to load:', pageToLoad);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      // Use /user-tasks to get all upcoming tasks, not just today's tasks
      const url = `${config.API_BASE_URL}/tasks/user-tasks?page=${pageToLoad}&size=${pageSize}`;
      console.log('Fetching user tasks from:', url);
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('User tasks response status:', res.status);
      console.log('User tasks response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('User tasks fetch failed:', errorText);
        throw new Error(`Failed to fetch user tasks: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      console.log('User tasks data received:', data);
      console.log('Number of tasks:', data.items ? data.items.length : 0);
      
      const newItems = data.items || [];
      setUserTasks(prev => pageToLoad === 0 ? newItems : [...prev, ...newItems]);
      setHasMore((data.page + 1) < data.totalPages);
      setPage(data.page);
    } catch (e) {
      console.error('Error fetching user tasks:', e);
    } finally {
      setListLoading(false);
    }
  };

  const fetchOtherTasks = async (pageToLoad = 0) => {
    if (otherTasksLoading || !isManager) return;
    setOtherTasksLoading(true);
    try {
      const token = localStorage.getItem('token');
      const today = toLocalDateOnly(new Date());
      const url = `${config.API_BASE_URL}/tasks/others-incoming?date=${today}&page=${pageToLoad}&size=${pageSize}`;
      console.log('Fetching other tasks from:', url);
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Other tasks response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Other tasks fetch failed:', errorText);
        throw new Error(`Failed to fetch other tasks: ${res.status}`);
      }
      const data = await res.json();
      console.log('Other tasks data:', data);
      const newItems = data.items || [];
      setOtherTasks(prev => pageToLoad === 0 ? newItems : [...prev, ...newItems]);
      setOtherTasksHasMore((data.page + 1) < data.totalPages);
      setOtherTasksPage(data.page);
    } catch (e) {
      console.error('Error fetching other tasks:', e);
    } finally {
      setOtherTasksLoading(false);
    }
  };

  const fetchCalendarTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const startDate = toLocalDateOnly(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      const endDate = toLocalDateOnly(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
      const response = await fetch(`${config.API_BASE_URL}/tasks/calendar?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Normalize LocalDate objects (if backend serializes as string it's fine)
        const normalized = (data || []).map(t => ({
          ...t,
          date: typeof t.date === 'string' ? t.date : (t.date?.year ? `${t.date.year}-${String(t.date.monthValue).padStart(2,'0')}-${String(t.date.dayOfMonth).padStart(2,'0')}` : t.date)
        }));
        setCalendarTasks(normalized);
      } else {
        console.error('Failed to fetch calendar tasks');
      }
    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
    }
  };

  const eventsByDate = useMemo(() => {
    const map = {};
    (calendarTasks || []).forEach(task => {
      const key = task.date; // expected ISO yyyy-mm-dd
      if (!map[key]) map[key] = { userTasks: [], otherTasks: [] };
      
      // Separate tasks by whether they belong to current user or others
      if (task.assignedUser === currentUser?.username) {
        map[key].userTasks.push(task);
      } else {
        map[key].otherTasks.push(task);
      }
    });
    return map;
  }, [calendarTasks, currentUser]);

  // Initial and dependency-based loads
  useEffect(() => {
    console.log('=== HOMEPAGE USEEFFECT TRIGGERED ===');
    console.log('User prop:', user);
    console.log('Current user state:', currentUser);
    console.log('Is manager calculated:', isManager);
    console.log('User role:', currentUser?.role);
    console.log('User isManager flag:', currentUser?.isManager);
    
    // Reset paging when user changes
    setUserTasks([]);
    setPage(0);
    setHasMore(true);
    
    console.log('About to call fetchUserTasks(0)');
    fetchUserTasks(0);
    
    // Reset other tasks for managers
    if (isManager) {
      console.log('Loading other tasks for manager');
      setOtherTasks([]);
      setOtherTasksPage(0);
      setOtherTasksHasMore(true);
      fetchOtherTasks(0);
    } else {
      console.log('Not a manager, skipping other tasks');
    }
  }, [user, isManager]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [user, selectedDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDateHuman = (dateString) => {
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

  const openDateModal = async (isoDate) => {
    setModalDate(isoDate);
    setModalTasks([]);
    setShowDateModal(true);
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/tasks/by-date?date=${isoDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks by date');
      const data = await res.json();
      setModalTasks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const currentDate = toLocalDateOnly(new Date(year, month, day));
      const dayTasks = eventsByDate[currentDate] || { userTasks: [], otherTasks: [] };
      
      const hasUserTasks = dayTasks.userTasks && dayTasks.userTasks.length > 0;
      const hasOtherTasks = dayTasks.otherTasks && dayTasks.otherTasks.length > 0;
      const hasTasks = hasUserTasks || hasOtherTasks;
      
      // Determine dot color: red for user tasks, green for only other tasks
      let dotClass = '';
      if (hasUserTasks) {
        dotClass = 'user-task-dot'; // Red dot
      } else if (hasOtherTasks) {
        dotClass = 'other-task-dot'; // Green dot
      }
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => {
            setShowCalendar(false);
            if (hasTasks && onNavigateToDate) {
              onNavigateToDate(currentDate);
            } else {
              // Navigate to date page even if no tasks, will show "no tasks" message
              onNavigateToDate && onNavigateToDate(currentDate);
            }
          }}
        >
          {day}
          {dotClass && <div className={`task-indicator ${dotClass}`}></div>}
        </div>
      );
    }
    
    return days;
  };

  const handleProfileSettings = () => {
    setShowProfileMenu(false);
    setShowProfileSettings(true);
  };

  const handleRoleManagement = () => {
    setShowProfileMenu(false);
    setShowRoleManagement(true);
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Placeholder delete handler for manager-only delete on list items
  const handleDeleteTask = (e, taskId) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove the deleted task from the UI
        setUserTasks(prev => prev.filter(task => task.id !== taskToDelete));
        setOtherTasks(prev => prev.filter(task => task.id !== taskToDelete));
        
        // Also refresh calendar tasks to update dots
        fetchCalendarTasks();
        
        setShowDeleteDialog(false);
        setTaskToDelete(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete task: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const grouped = useMemo(() => groupByDate(userTasks), [userTasks]);
  const groupedOtherTasks = useMemo(() => groupByDate(otherTasks), [otherTasks]);

  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-content">
          {/* Calendar Icon - Top Left */}
          <div className="calendar-section" ref={calendarRef}>
            <button 
              className="calendar-button"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="currentColor"/>
              </svg>
            </button>
            
            {/* History Button - Right next to calendar */}
            <button
              className="history-icon-button"
              onClick={() => onNavigateToHistory && onNavigateToHistory()}
              title="View Task History"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12L16 16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Calendar Dropdown */}
            {showCalendar && (
              <div className="calendar-dropdown">
                <div className="calendar-header">
                  <button 
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    className="calendar-nav"
                  >
                    ‹
                  </button>
                  <span className="calendar-month">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    className="calendar-nav"
                  >
                    ›
                  </button>
                </div>
                <div className="calendar-weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {generateCalendar()}
                </div>
              </div>
            )}
          </div>

          {/* Center Title */}
          <div className="header-title">
            <h1>Dashboard</h1>
          </div>

          {/* Profile Menu - Top Right */}
          <div className="profile-section" ref={profileRef}>
            {/* For managers: Assign Task button (rectangle white) moved to the right area */}
            {isManager && (
              <button
                className="add-task-button"
                onClick={onOpenAssignTask}
                title="Assign New Task"
              >
                Assign Task
              </button>
            )}

            <button 
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {currentUser?.profilePicture || currentUser?.avatar ? (
                  <img 
                    src={(currentUser.profilePicture || currentUser.avatar).startsWith('data:') || (currentUser.profilePicture || currentUser.avatar).startsWith('http') 
                      ? (currentUser.profilePicture || currentUser.avatar)
                      : `${config.FILES_BASE_URL}/profiles/${(currentUser.profilePicture || currentUser.avatar).split('/').pop()}`} 
                    alt="Profile" 
                    className="profile-avatar-image"
                  />
                ) : (
                  currentUser?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-name">{currentUser?.username || 'User'}</div>
                  <div className="profile-email">{currentUser?.email || 'user@example.com'}</div>
                </div>
                <hr className="profile-divider" />
                <button className="profile-menu-item" onClick={handleProfileSettings}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                  </svg>
                  Profile Settings
                </button>
                {isManager && (
                  <button className="profile-menu-item" onClick={handleRoleManagement}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14ZM16.5 16C18.43 16 20 14.43 20 12.5S18.43 9 16.5 9S13 10.57 13 12.5S14.57 16 16.5 16ZM7.5 16C9.43 16 11 14.43 11 12.5S9.43 9 7.5 9S4 10.57 4 12.5S5.57 16 7.5 16ZM8 18C5.79 18 4 19.79 4 22H12C12 19.79 10.21 18 8 18ZM16 18C13.79 18 12 19.79 12 22H20C20 19.79 18.21 18 16 18Z" fill="currentColor"/>
                    </svg>
                    Management
                  </button>
                )}
                <button className="profile-menu-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19.14,12.94C19.18,12.64 19.2,12.33 19.2,12C19.2,11.68 19.18,11.36 19.13,11.06L21.16,9.48C21.34,9.34 21.39,9.07 21.28,8.87L19.36,5.55C19.24,5.33 18.99,5.26 18.77,5.33L16.38,6.29C15.93,5.93 15.45,5.64 14.92,5.43L14.5,2.89C14.46,2.65 14.25,2.47 14,2.47H10.08C9.83,2.47 9.62,2.65 9.58,2.89L9.16,5.43C8.63,5.64 8.15,5.93 7.7,6.29L5.31,5.33C5.09,5.26 4.84,5.33 4.72,5.55L2.8,8.87C2.68,9.07 2.73,9.34 2.91,9.48L4.94,11.06C4.89,11.36 4.87,11.68 4.87,12C4.87,12.33 4.89,12.64 4.94,12.94L2.91,14.52C2.73,14.66 2.68,14.93 2.8,15.13L4.72,18.45C4.84,18.67 5.09,18.74 5.31,18.67L7.7,17.71C8.15,18.07 8.63,18.36 9.16,18.57L9.58,21.11C9.62,21.35 9.83,21.53 10.08,21.53H14C14.25,21.53 14.46,21.35 14.5,21.11L14.92,18.57C15.45,18.36 15.93,18.07 16.38,17.71L18.77,18.67C18.99,18.74 19.24,18.67 19.36,18.45L21.28,15.13C21.39,14.93 21.34,14.66 21.16,14.52L19.14,12.94ZM12,15.6C10.02,15.6 8.4,13.98 8.4,12C8.4,10.02 10.02,8.4 12,8.4C13.98,8.4 15.6,10.02 15.6,12C15.6,13.98 13.98,15.6 12,15.6Z" fill="currentColor"/>
                  </svg>
                  Settings
                </button>
                <button className="profile-menu-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V19H11V17H5V15H11V13H5V11H11V9H21ZM13 7H19V9H13V7ZM13 11H21V13H13V11ZM13 15H21V17H13V15ZM13 19H21V21H13V19Z" fill="currentColor"/>
                  </svg>
                  Help & Support
                </button>
                <hr className="profile-divider" />
                <button className="profile-menu-item logout" onClick={onLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - User Tasks grouped by date with Load More */}
      <main className="homepage-main">
        <div className="content-wrapper">
          <section className="activities-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>My Tasks</h2>
              </div>
            </div>
            <div className="tasks-scrollable-container">
              {userTasks.length === 0 && !listLoading ? (
                <div className="no-tasks-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="no-tasks-icon">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No tasks assigned</p>
                  <span>Tasks will appear here when assigned to you</span>
                </div>
              ) : (
                <div className="tasks-list">
                  {grouped.map(group => (
                    <div key={group.date} className="date-group">
                      <div className="date-header">{formatDateHuman(group.date)}</div>
                      {group.items.map(activity => (
                        <div 
                          key={activity.id} 
                          className="task-card clickable"
                          onClick={() => onNavigateToTask && onNavigateToTask(activity.id)}
                        >
                          <div className="task-header">
                            <div className="task-user">
                              <div className="task-avatar">
                                {(activity.assigned_user || activity.assignedUser) ? (activity.assigned_user || activity.assignedUser).charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="task-user-info">
                                <span className="task-username">{activity.assigned_user || activity.assignedUser}</span>
                                <span className="task-date">{formatDateHuman(activity.date || activity.dueDate)}</span>
                              </div>
                            </div>
                            <div className="task-header-right">
                              <div className="task-badges">
                                <span 
                                  className="task-priority-badge"
                                  style={{ backgroundColor: getPriorityColor(activity.priority) }}
                                >
                                  {activity.priority}
                                </span>
                                <span 
                                  className="task-status-badge"
                                  style={{ backgroundColor: getStatusColor(activity.status) }}
                                >
                                  {activity.status}
                                </span>
                              </div>
                              {isManager && (
                                <button
                                  className="icon-button delete-icon-btn"
                                  title="Delete Task"
                                  onClick={(e) => handleDeleteTask(e, activity.id)}
                                  aria-label="Delete Task"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="task-content">
                            <p className="task-description">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="load-more-row">
                    {hasMore && (
                      <button className="load-more-button" onClick={() => fetchUserTasks(page + 1)} disabled={listLoading}>
                        {listLoading ? 'Loading...' : 'Load More'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Others' Incoming Tasks Section - Only for Managers */}
          {isManager && (
            <section className="activities-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h2>Others' Incoming Tasks</h2>
                </div>
              </div>
              <div className="tasks-scrollable-container">
                {otherTasks.length === 0 && !otherTasksLoading ? (
                  <div className="no-tasks-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="no-tasks-icon">
                      <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>No upcoming tasks for other team members</p>
                    <span>Tasks assigned to others will appear here</span>
                  </div>
                ) : (
                  <div className="tasks-list">
                    {groupedOtherTasks.map(group => (
                      <div key={group.date} className="date-group">
                        <div className="date-header">{formatDateHuman(group.date)}</div>
                        {group.items.map(activity => (
                          <div 
                            key={activity.id} 
                            className="task-card clickable"
                            onClick={() => onNavigateToTask && onNavigateToTask(activity.id)}
                          >
                            <div className="task-header">
                              <div className="task-user">
                                <div className="task-avatar">
                                  {(activity.assigned_user || activity.assignedUser) ? (activity.assigned_user || activity.assignedUser).charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="task-user-info">
                                  <span className="task-username">{activity.assigned_user || activity.assignedUser}</span>
                                  <span className="task-date">{formatDateHuman(activity.date || activity.dueDate)}</span>
                                </div>
                              </div>
                              <div className="task-header-right">
                                <div className="task-badges">
                                  <span 
                                    className="task-priority-badge"
                                    style={{ backgroundColor: getPriorityColor(activity.priority) }}
                                  >
                                    {activity.priority}
                                  </span>
                                  <span 
                                    className="task-status-badge"
                                    style={{ backgroundColor: getStatusColor(activity.status) }}
                                  >
                                    {activity.status}
                                  </span>
                                </div>
                                <button
                                  className="icon-button delete-icon-btn"
                                  title="Delete Task"
                                  onClick={(e) => handleDeleteTask(e, activity.id)}
                                  aria-label="Delete Task"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="task-content">
                              <p className="task-description">{activity.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="load-more-row">
                      {otherTasksHasMore && (
                        <button className="load-more-button" onClick={() => fetchOtherTasks(otherTasksPage + 1)} disabled={otherTasksLoading}>
                          {otherTasksLoading ? 'Loading...' : 'Load More'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Date modal showing all tasks for a selected date */}
      {showDateModal && (
        <div className="date-modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="date-modal" onClick={(e) => e.stopPropagation()}>
            <div className="date-modal-header">
              <h3>Tasks on {formatDateHuman(modalDate)}</h3>
              <button className="calendar-popover-close" onClick={() => setShowDateModal(false)} aria-label="Close">×</button>
            </div>
            <div className="date-modal-body">
              {modalLoading ? (
                <div className="no-tasks-message"><p>Loading...</p></div>
              ) : modalTasks.length === 0 ? (
                <div className="no-tasks-message"><p>No tasks for this date</p></div>
              ) : (
                <ul className="calendar-popover-list">
                  {modalTasks.map(ev => (
                    <li key={ev.id} className="calendar-popover-item">
                      <div className="calendar-popover-title">{ev.description}</div>
                      <div className="calendar-popover-badges">
                        <span className={`badge status`}>{(ev.status || '').toString().toLowerCase().replace('_',' ')}</span>
                        <span className={`badge priority`}>{(ev.priority || '').toString().toLowerCase()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings
          user={currentUser}
          onClose={() => setShowProfileSettings(false)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Role Management Modal */}
      {showRoleManagement && (
        <RoleManagement
          onClose={() => setShowRoleManagement(false)}
          currentUser={currentUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Homepage;
