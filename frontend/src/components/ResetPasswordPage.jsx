import { useState, useEffect } from 'react';
import '../styles/ResetPasswordPage.css';
import config from '../config/api';

function ResetPasswordPage({ onBackToLogin }) {
  // Get token from URL
  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  };

  const token = getTokenFromUrl();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate token
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/validate-reset-token/${token}`);
      const data = await response.json();
      
      if (data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError('This reset link has expired or is invalid. Please request a new password reset.');
      }
    } catch (error) {
      setTokenValid(false);
      setError('Unable to validate reset link. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          // Clear the URL parameters and go back to login
          window.history.replaceState({}, document.title, window.location.pathname);
          onBackToLogin();
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    // Clear the URL parameters and go back to login
    window.history.replaceState({}, document.title, window.location.pathname);
    onBackToLogin();
  };

  if (tokenValid === null) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="loading-message">Validating reset link...</div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <h1>Reset Password</h1>
          </div>
          <div className="error-message">{error}</div>
          <button onClick={goToLogin} className="back-to-login-btn">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
              required
              minLength="6"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              required
              minLength="6"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="reset-password-btn" disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="reset-password-footer">
          <button onClick={goToLogin} className="back-to-login-link">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
