import React, { useEffect, useMemo, useState, useRef } from 'react';
import '../styles/AssignTaskPage.css';
import config from '../config/api';

const AssignTaskPage = ({ onCancel, onSubmitted }) => {
  const [staffUsers, setStaffUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/tasks/staff`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStaffUsers(data);
        }
      } catch (e) {
        console.error('Failed to fetch staff list', e);
      }
    };
    fetchStaffUsers();
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return staffUsers.filter(u => (
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    ));
  }, [staffUsers, searchTerm]);

  const handleUserSelect = (username) => {
    setSelectedUser(username);
    setSearchTerm(username);
    setShowDropdown(false);
  };

  const handlePrioritySelect = (selectedPriority) => {
    setPriority(selectedPriority);
    setShowPriorityDropdown(false);
  };

  const handleStatusSelect = (selectedStatus) => {
    setStatus(selectedStatus);
    setShowStatusDropdown(false);
  };

  const getRoleColor = (role) => {
    const r = (role || '').toString().toLowerCase();
    switch (r) {
      case 'admin': return '#dc2626';
      case 'manager': return '#ea580c';
      case 'user': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: '#2ed573' },
    { value: 'MEDIUM', label: 'Medium', color: '#ffa502' },
    { value: 'HIGH', label: 'High', color: '#ff4757' }
  ];

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: '#ffa502' },
    { value: 'SCHEDULED', label: 'Scheduled', color: '#5f27cd' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#3742fa' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tasks/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignedUser: selectedUser,
          date,
          description: description.trim(),
          status,
          priority
        })
      });

      if (response.ok) {
        await response.json();
        if (onSubmitted) onSubmitted();
      } else {
        const error = await response.json();
        alert(error?.error || 'Failed to assign task');
      }
    } catch (err) {
      console.error('Error assigning task:', err);
      alert('Failed to assign task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assign-task-page">
      <div className="assign-task-page__header">
        <h2>Assign Task</h2>
      </div>

      <form className="assign-task-page__form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="assignee">Assign To</label>
            <div className="search-dropdown-container" ref={dropdownRef}>
              <input
                id="assignee"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedUser('');
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for staff member..."
                className="search-input"
                required
              />
              {showDropdown && filteredUsers.length > 0 && (
                <div className="dropdown-menu">
                  {filteredUsers.map((u) => (
                    <div key={u.username} className="dropdown-item" onClick={() => handleUserSelect(u.username)}>
                      <div className="user-option">
                        <div className="user-avatar">{u.avatar || u.username?.[0]?.toUpperCase() || 'U'}</div>
                        <div className="user-info">
                          <span className="user-name">{u.username}</span>
                          <span className="user-email">{u.email}</span>
                        </div>
                        <div className="user-role-badge" style={{ backgroundColor: getRoleColor(u.role) }}>
                          {u.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Due Date</label>
            <div className="date-input-container">
              <input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                className="date-input"
              />
              <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="#6b7280"/>
              </svg>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <div className="custom-dropdown-container" ref={priorityDropdownRef}>
              <div 
                className="custom-dropdown-trigger"
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              >
                <div className="selected-option">
                  <div 
                    className="option-indicator" 
                    style={{ backgroundColor: priorityOptions.find(p => p.value === priority)?.color }}
                  ></div>
                  {priorityOptions.find(p => p.value === priority)?.label}
                </div>
                <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 20 20">
                  <path stroke="#6b7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                </svg>
              </div>
              {showPriorityDropdown && (
                <div className="dropdown-menu">
                  {priorityOptions.map((option) => (
                    <div 
                      key={option.value} 
                      className={`dropdown-item ${priority === option.value ? 'selected' : ''}`}
                      onClick={() => handlePrioritySelect(option.value)}
                    >
                      <div className="option-content">
                        <div className="option-indicator" style={{ backgroundColor: option.color }}></div>
                        <span>{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <div className="custom-dropdown-container" ref={statusDropdownRef}>
              <div 
                className="custom-dropdown-trigger"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <div className="selected-option">
                  <div 
                    className="option-indicator" 
                    style={{ backgroundColor: statusOptions.find(s => s.value === status)?.color }}
                  ></div>
                  {statusOptions.find(s => s.value === status)?.label}
                </div>
                <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 20 20">
                  <path stroke="#6b7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                </svg>
              </div>
              {showStatusDropdown && (
                <div className="dropdown-menu">
                  {statusOptions.map((option) => (
                    <div 
                      key={option.value} 
                      className={`dropdown-item ${status === option.value ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect(option.value)}
                    >
                      <div className="option-content">
                        <div className="option-indicator" style={{ backgroundColor: option.color }}></div>
                        <span>{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Task Description</label>
          <textarea
            id="description"
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed task description..."
            required
          />
        </div>

        <div className="assign-task-page__actions">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={isSubmitting || !selectedUser || !description.trim()}>
            {isSubmitting ? 'Assigning...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTaskPage;