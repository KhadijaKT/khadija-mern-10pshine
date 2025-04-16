import React from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/auth/InputField';
import { registerUser } from '../utils/api'; // Add this import
import './AuthPages.css';

const Signup = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }
  
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const data = await registerUser(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
  
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/');
      } else {
        throw new Error('Registration completed but no token received');
      }
    } catch (error) {
      // Handle different error scenarios
      if (error.message.includes('User already exists')) {
        setError('This email is already registered');
      } else if (error.message.includes('Server returned non-JSON')) {
        setError('Server error - please try again later');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h1 className="auth-title">Sign Up</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <InputField
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <InputField
            label="Password (min 6 characters)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            minLength="6"
          />
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="toggle-text">
          Already have an account?{' '}
          <span className="toggle-link" onClick={() => !isLoading && navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;