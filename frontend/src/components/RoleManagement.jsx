import React, { useState, useEffect, useRef } from 'react';
import '../styles/RoleManagement.css';

const RoleManagement = ({ onClose, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleDropdownPosition, setRoleDropdownPosition] = useState('down');
  
  const userDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  const roles = [
    { value: 'MANAGER', label: 'Manager', color: '#8e44ad' },
    { value: 'STAFF_DEVELOPER', label: 'Staff - Developer', color: '#3498db' },
    { value: 'STAFF_DESIGNER', label: 'Staff - Designer', color: '#e74c3c' },
    { value: 'STAFF_GENERAL', label: 'Staff - General', color: '#95a5a6' },
    { value: 'STAFF_ANALYST', label: 'Staff - Analyst', color: '#f39c12' },
    { value: 'STAFF_COORDINATOR', label: 'Staff - Coordinator', color: '#27ae60' }
  ];

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users to exclude current user
  useEffect(() => {
    if (users.length > 0 && currentUser) {
      const filtered = users.filter(user => user.id !== currentUser.id && user.username !== currentUser.username);
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, currentUser]);

  // Update user role
  const updateUserRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert('Please select both a user and a role');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole })
      });

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: selectedRole }
            : user
        ));
        
        // Update selected user
        setSelectedUser(prev => ({ ...prev, role: selectedRole }));
        
        alert('Role updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update role: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role || '');
    setShowUserDropdown(false);
  };

    // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
  };

  // Handle role dropdown toggle with positioning check
  const handleRoleDropdownToggle = () => {
    if (!showRoleDropdown && roleDropdownRef.current) {
      const rect = roleDropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 240; // Approximate dropdown height
      
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setRoleDropdownPosition('up');
      } else {
        setRoleDropdownPosition('down');
      }
    }
    setShowRoleDropdown(!showRoleDropdown);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleDisplayName = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : '#747d8c';
  };

  return (
    <div className="role-management-overlay" onClick={onClose}>
      <div className="role-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="role-management-header">
          <h2>Role Management</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="role-management-content">
          {loading ? (
            <div className="loading-message">Loading users...</div>
          ) : (
            <>
              {/* User Selection */}
              <div className="form-group">
                <label htmlFor="user-select">Select User</label>
                <div className="custom-dropdown" ref={userDropdownRef}>
                  <div 
                    className="dropdown-trigger"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  >
                    <span className="dropdown-value">
                      {selectedUser ? (
                        <div className="user-option">
                          <div className="user-avatar">
                            {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{selectedUser.username}</span>
                            <span className="user-email">{selectedUser.email}</span>
                          </div>
                        </div>
                      ) : (
                        'Select a user...'
                      )}
                    </span>
                    <svg className={`dropdown-arrow ${showUserDropdown ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {showUserDropdown && (
                    <div className="dropdown-menu">
                      {filteredUsers.length === 0 ? (
                        <div className="dropdown-option disabled">
                          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                            No other users available to manage
                          </span>
                        </div>
                      ) : (
                        filteredUsers.map(user => (
                          <div 
                            key={user.id} 
                            className={`dropdown-option ${selectedUser?.id === user.id ? 'selected' : ''}`}
                            onClick={() => handleUserSelect(user)}
                          >
                            <div className="user-option">
                              <div className="user-avatar">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="user-info">
                                <span className="user-name">{user.username}</span>
                                <span className="user-email">{user.email}</span>
                              </div>
                              <div className="user-role-badge" style={{ backgroundColor: getRoleColor(user.role) }}>
                                {getRoleDisplayName(user.role)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label htmlFor="role-select">Assign Role</label>
                <div className="custom-dropdown" ref={roleDropdownRef}>
                  <div 
                    className="dropdown-trigger"
                    onClick={handleRoleDropdownToggle}
                  >
                    <span className="dropdown-value">
                      {selectedRole ? (
                        <div className="role-option">
                          <div 
                            className="role-indicator" 
                            style={{ backgroundColor: getRoleColor(selectedRole) }}
                          ></div>
                          <span>{getRoleDisplayName(selectedRole)}</span>
                        </div>
                      ) : (
                        'Select a role...'
                      )}
                    </span>
                    <svg className={`dropdown-arrow ${showRoleDropdown ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {showRoleDropdown && (
                    <div className={`dropdown-menu ${roleDropdownPosition === 'up' ? 'dropdown-up' : ''}`}>
                      {roles.map(role => (
                        <div 
                          key={role.value} 
                          className={`dropdown-option ${selectedRole === role.value ? 'selected' : ''}`}
                          onClick={() => handleRoleSelect(role.value)}
                        >
                          <div className="role-option">
                            <div 
                              className="role-indicator" 
                              style={{ backgroundColor: role.color }}
                            ></div>
                            <span>{role.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Role Display */}
              {selectedUser && (
                <div className="current-role-info">
                  <strong>Current Role:</strong> 
                  <span 
                    className="current-role-badge"
                    style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                  >
                    {getRoleDisplayName(selectedUser.role)}
                  </span>
                </div>
              )}

              {/* Save Button */}
              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={updateUserRole}
                  disabled={!selectedUser || !selectedRole || saving}
                >
                  {saving ? 'Saving...' : 'Save Role'}
                </button>
                <button className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
