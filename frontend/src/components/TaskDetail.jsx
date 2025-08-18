import React, { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';
import '../styles/TaskDetail.css';
import config from '../config/api';

const TaskDetail = ({ taskId, onBack, user }) => {
  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    assignedUser: '',
    date: '',
    description: '',
    status: '',
    priority: ''
  });

  const isManager = user?.isManager || user?.role === 'Manager';

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
      if (isManager) {
        fetchStaffUsers();
      }
    }
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTask(data);
        setEditForm({
          assignedUser: data.assignedUser || '',
          date: data.date || '',
          description: data.description || '',
          status: data.status || '',
          priority: data.priority || ''
        });
      } else {
        console.error('Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${config.API_BASE_URL}/tasks/staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStaffUsers(data);
      }
    } catch (error) {
      console.error('Error fetching staff users:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      assignedUser: task.assignedUser || '',
      date: task.date || '',
      description: task.description || '',
      status: task.status || '',
      priority: task.priority || ''
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTask(updatedTask);
        setIsEditing(false);
      } else {
        console.error('Failed to update task');
        alert('Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        onBack(); // Navigate back to homepage after successful deletion
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

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateInputClick = () => {
    // Ensure the date picker opens when clicking anywhere on the input
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.showPicker?.(); // Modern browsers
      dateInput.focus(); // Fallback for older browsers
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
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

  if (loading) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-error">
          <p>Task not found</p>
          <button onClick={onBack} className="back-button">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-detail-container">
      {/* Top Bar (no edit/delete here; moved into main card) */}
      <div className="task-detail-header">
        <button onClick={onBack} className="back-button" title="Go Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="task-detail-title">Task Details</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Task Content */}
      <div className="task-detail-content">
        {!isEditing ? (
          // Read-only view
          <div className="task-detail-view">
            {isManager && (
              <div className="task-card-actions">
                {!isEditing && (
                  <>
                    <button onClick={handleEdit} className="edit-button icon-button" title="Edit Task">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowDeleteDialog(true)} 
                      className="delete-button icon-button" 
                      title="Delete Task"
                      disabled={deleting}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="task-detail-section">
              <div className="task-detail-field">
                <label>Assigned To</label>
                <div className="task-user-display">
                  <div className="task-avatar">
                    {task.assignedUser ? task.assignedUser.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="task-username">{task.assignedUser}</span>
                </div>
              </div>

              <div className="task-detail-field">
                <label>Due Date</label>
                <p className="field-value">{formatDate(task.date)}</p>
              </div>

              <div className="task-detail-field">
                <label>Status</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="task-detail-field">
                <label>Priority</label>
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
              </div>

              <div className="task-detail-field">
                <label>Description</label>
                <p className="field-value description">{task.description}</p>
              </div>

              {task.assignedBy && (
                <div className="task-detail-field">
                  <label>Assigned By</label>
                  <div className="task-assigner-display">
                    <div className="task-avatar">
                      {task.assignedBy.charAt(0).toUpperCase()}
                    </div>
                    <span className="task-assigner-name">{task.assignedBy}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Edit mode
          <div className="task-detail-edit">
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedUser">Assigned To</label>
                  <select
                    id="assignedUser"
                    value={editForm.assignedUser}
                    onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select user...</option>
                    {staffUsers.map((staffUser) => (
                      <option key={staffUser.username} value={staffUser.username}>
                        {staffUser.username} ({staffUser.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="date">Due Date</label>
                  <div className="date-input-container" onClick={handleDateInputClick}>
                    <input
                      type="date"
                      id="date"
                      value={editForm.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="form-input date-input"
                      onClick={handleDateInputClick}
                    />
                    <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="#6b7280"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={editForm.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="form-input"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={editForm.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="form-input"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="form-input description-input"
                  rows="4"
                  placeholder="Enter task description..."
                />
              </div>
            </div>

            {/* Edit Actions */}
            <div className="edit-actions">
              <button
                onClick={handleCancel}
                className="cancel-button"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="save-button"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TaskDetail;