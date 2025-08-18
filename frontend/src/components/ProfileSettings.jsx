import React, { useState, useRef, useEffect } from 'react';
import '../styles/ProfileSettings.css';
import config from '../config/api';

const ProfileSettings = ({ user, onClose, onUpdateProfile }) => {
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    profilePicture: user?.avatar || user?.profilePicture || null
  });
  const [previewImage, setPreviewImage] = useState(user?.avatar || user?.profilePicture || null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        profilePicture: user.avatar || user.profilePicture || null
      });
      setPreviewImage(user.avatar || user.profilePicture || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setProfileData(prev => ({
        ...prev,
        profilePictureFile: file,
        removePicture: false // Clear removal flag when new file is selected
      }));
      setMessage('');
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileData(prev => ({
      ...prev,
      profilePicture: null,
      profilePictureFile: null,
      removePicture: true // Flag to indicate picture removal
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage('');

    try {
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('email', profileData.email);
    
    if (profileData.profilePictureFile instanceof File) {
      formData.append('avatar', profileData.profilePictureFile);
    } else if (profileData.removePicture) {
      formData.append('removeProfilePicture', 'true');
    }      const response = await fetch('${config.API_BASE_URL}/profile', {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        if (onUpdateProfile) {
          onUpdateProfile(data.user);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="profile-settings-overlay" onClick={onClose}>
      <div className="profile-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-settings-header">
          <h2>Profile Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="profile-settings-form">
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              <div className="profile-picture-wrapper" onClick={handleImageClick}>
                {previewImage ? (
                  <img 
                    src={previewImage.startsWith('data:') || previewImage.startsWith('http') 
                      ? previewImage 
                      : `${config.FILES_BASE_URL}/profiles/${previewImage.split('/').pop()}`} 
                    alt="Profile" 
                    className="profile-picture-preview"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    {getInitials(profileData.username)}
                  </div>
                )}
                <div className="profile-picture-overlay">
                  <span>Change Photo</span>
                </div>
              </div>
              
              {previewImage && (
                <button 
                  type="button" 
                  className="remove-picture-btn"
                  onClick={handleRemoveImage}
                >
                  Remove
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <div className="upload-instructions">
              <p>Click to upload a profile picture</p>
              <p className="upload-note">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;