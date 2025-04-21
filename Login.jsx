import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/auth/InputField';
import { loginUser, API_URL } from '../utils/api';
import './AuthPages.css';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';  // Importing Eye icons

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverOnline, setServerOnline] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        setServerOnline(response.ok);
      } catch (error) {
        setServerOnline(false);
        console.error('Server check error:', error);
      }
    };

    if (isAuthenticated) {
      navigate('/');
      return;
    }

    checkServer();
  }, [navigate, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await loginUser(formData.email, formData.password);
      login(data.token, data.user);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!serverOnline) {
    return (
      <div className="auth-container">
        <div className="form-card">
          <h1 className="auth-title">Server Unavailable</h1>
          <p className="error-message">The server is currently unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="form-card">
        <h1 className="auth-title">Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <div className="password-input-container">
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="show-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="toggle-text">
          Don't have an account?{' '}
          <span 
            className="toggle-link" 
            onClick={() => !isLoading && navigate('/signup')}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
