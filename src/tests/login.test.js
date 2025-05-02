import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('../utils/api', () => ({
  loginUser: jest.fn(),
  API_URL: 'http://localhost:5000/api'
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

const renderLoginComponent = (authContextValue = {}) => {
  useAuth.mockReturnValue({
    login: jest.fn(),
    isAuthenticated: false,
    ...authContextValue
  });
  
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      })
    );
  });

  test('renders login form correctly', async () => {
    renderLoginComponent();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderLoginComponent();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const form = screen.getByRole('form'); 
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/please enter a valid email address/i);
    });
  });
  
  test('validates required fields', async () => {
    renderLoginComponent();
  
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    const form = screen.getByRole('form');
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/please fill in all fields/i);
    });
  });

  test('shows password when toggle button is clicked', async () => {
    renderLoginComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const showPasswordButton = screen.getByTestId('toggle-password-visibility');
    fireEvent.click(showPasswordButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(showPasswordButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('handles successful login', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);
    
    const mockLogin = jest.fn();
    renderLoginComponent({ login: mockLogin });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    const mockUserData = { 
      token: 'fake-token', 
      user: { id: '123', email: 'test@example.com' } 
    };
    loginUser.mockResolvedValueOnce(mockUserData);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /^login$/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith('fake-token', mockUserData.user);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles login failure', async () => {
    renderLoginComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    const errorMessage = 'Invalid credentials';
    loginUser.mockRejectedValueOnce(new Error(errorMessage));
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /^login$/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);
    
    const errorElement = await screen.findByTestId('error-message');
    expect(errorElement).toHaveTextContent(errorMessage);
  });

  test('redirects if user is already authenticated', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);
    
    renderLoginComponent({ isAuthenticated: true });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows server unavailable message when server is offline', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    
    renderLoginComponent();
    
    expect(await screen.findByText('Server Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/the server is currently unavailable/i)).toBeInTheDocument();
  });

  test('disables form submission while loading', async () => {
    renderLoginComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    
    loginUser.mockImplementation(() => new Promise(resolve => setTimeout(() => {
      resolve({ token: 'fake-token', user: { id: '123' } });
    }, 100)));
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /^login$/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/logging in\.\.\./i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalled();
    });
  });
});