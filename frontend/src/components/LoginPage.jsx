import React, { useState } from 'react';
import '../styles/LoginPage.css';
import config from '../config/api';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Registration form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regIsLoading, setRegIsLoading] = useState(false);
  
  // Forgot password form state
  const [forgotEmailOrUsername, setForgotEmailOrUsername] = useState('');
  const [forgotIsLoading, setForgotIsLoading] = useState(false);
  
  // Messages
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Can be email or username
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful! Welcome back.');
        setMessageType('success');
        
        // Persist auth token if provided by backend
        if (data && data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Call the success callback to navigate to the main app
        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 1000); // Small delay to show success message
        }
      } else {
        setMessage(data.error || 'Login failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    setShowRegister(!showRegister);
    setMessage(''); // Clear any existing messages
    setMessageType('');
    // Clear registration form when toggling
    if (!showRegister) {
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setRegIsLoading(true);
    setMessage('');

    // Validation
    if (regPassword !== regConfirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setRegIsLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      setRegIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! You can now sign in.');
        setMessageType('success');
        // Clear form and close modal
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setShowRegister(false);
      } else {
        // Handle specific error messages from backend
        if (data.error) {
          if (data.error.includes('Username already exists')) {
            setMessage('This username is already taken. Please choose a different username.');
          } else if (data.error.includes('Email already exists')) {
            setMessage('This email is already registered. Please use a different email or try signing in.');
          } else {
            setMessage(data.error);
          }
        } else {
          setMessage('Registration failed. Please try again.');
        }
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setRegIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setMessage('');
    setMessageType('');
    setForgotEmailOrUsername('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: forgotEmailOrUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Check your email for password reset instructions.');
        setMessageType('success');
        // Close the modal after success
        setTimeout(() => {
          setShowForgotPassword(false);
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to send reset instructions');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setForgotIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Login Form */}
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form className="login-form" onSubmit={handleSignIn}>
          {/* Email Input */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password-container">
            <button 
              type="button" 
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button 
            type="submit" 
            className={`sign-in-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Register Link */}
          <div className="register-container">
            <span className="register-text">Don't have an account? </span>
            <button 
              type="button" 
              className="register-link"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </form>
      </div>

      {/* Register Form Modal */}
      {showRegister && (
        <div className="register-form-overlay" onClick={() => setShowRegister(false)}>
          <div className="register-form" onClick={(e) => e.stopPropagation()}>
            <h3>Create Account</h3>
            
            {/* Message Display in Registration Modal */}
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleRegistrationSubmit}>
              <input 
                type="text" 
                placeholder="Username" 
                className="login-input"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="login-input"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="login-input"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                className="login-input"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className={`sign-in-button ${regIsLoading ? 'loading' : ''}`}
                disabled={regIsLoading}
              >
                {regIsLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            
            <button 
              type="button" 
              className="register-link"
              onClick={() => setShowRegister(false)}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="register-form-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="register-form" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            
            {/* Message Display in Forgot Password Modal */}
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleForgotPasswordSubmit}>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>
                Enter your username or email address and we'll send you password reset instructions.
              </p>
              <input 
                type="text" 
                placeholder="Username or Email" 
                className="login-input"
                value={forgotEmailOrUsername}
                onChange={(e) => setForgotEmailOrUsername(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className={`sign-in-button ${forgotIsLoading ? 'loading' : ''}`}
                disabled={forgotIsLoading}
              >
                {forgotIsLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
            
            <button 
              type="button" 
              className="register-link"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;