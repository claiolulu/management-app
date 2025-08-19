import React, { useState, useEffect, useRef } from 'react';
import '../styles/AssignTask.css';
import config from '../config/api';

const AssignTask = ({ onClose, onTaskAssigned }) => {
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
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
      } else {
        console.error('Failed to fetch staff users');
      }
    } catch (error) {
      console.error('Error fetching staff users:', error);
    }
  };

  const filteredUsers = staffUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    
    if (!selectedUser || !description.trim()) {
      alert('Please select a user and enter a task description');
      return;
    }

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
          date: date,
          description: description.trim(),
          status: status,
          priority: priority
        })
      });

      if (response.ok) {
        await response.json();
        alert('Task assigned successfully!');
        onTaskAssigned && onTaskAssigned();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to assign task: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="assign-task-overlay">
      <div className="assign-task-modal">
        <div className="assign-task-header">
          <h2>Assign New Task</h2>
          <button className="close-button" onClick={handleCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="assign-task-form">
          <div className="form-group">
            <label htmlFor="assignee">Assign To</label>
            <div className="search-dropdown-container" ref={dropdownRef}>
              <input
                type="text"
                id="assignee"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setSelectedUser('');
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for staff member..."
                className="search-input"
                required
              />
              
              {showDropdown && filteredUsers.length > 0 && (
                <div className="dropdown-menu">
                  {filteredUsers.map((staffUser) => (
                    <div
                      key={staffUser.username}
                      className="dropdown-item"
                      onClick={() => handleUserSelect(staffUser.username)}
                    >
                      <div className="user-info">
                        <div className="user-avatar">
                          {staffUser.avatar || staffUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{staffUser.username}</div>
                          <div className="user-role">{staffUser.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Due Date</label>
              <div className="date-input-container">
                <input
                  type="date"
                  id="date"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed task description..."
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTask;