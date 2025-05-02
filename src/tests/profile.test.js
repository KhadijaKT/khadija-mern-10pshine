import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('../components/layout/Header', () => () => (
  <header data-testid="header">Header</header>
));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  }
}));

jest.mock('react-icons/io5', () => ({
  IoArrowBack: () => <span data-testid="back-icon">Back</span>
}));

jest.mock('axios');

import Profile from '../pages/Profile';

describe('Profile Component', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    joinDate: '2023-01-01',
    avatar: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });
  
  test('renders without crashing', async () => {
    // Resolve the axios promise before component renders to avoid act() warnings
    axios.get.mockResolvedValue({ data: mockUser });
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
    });
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
  
  test('fetches user profile on mount', async () => {
    axios.get.mockResolvedValue({ data: mockUser });
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      '/api/users/profile',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
  });
  
  test('displays user information correctly', async () => {
    axios.get.mockResolvedValue({ data: mockUser });
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/2023-01-01/)).toBeInTheDocument();
      expect(screen.getByAltText('User Icon')).toBeInTheDocument();
    });
  });
  
  test('logout button removes token and navigates to login', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    axios.get.mockResolvedValue({ data: mockUser });
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
    });
    
    await waitFor(() => screen.getByText('Logout'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });
    
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
  
  test('back button navigates to home page', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    axios.get.mockResolvedValue({ data: mockUser });
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
    });
    
    await waitFor(() => screen.getByTestId('back-icon'));
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('back-icon').closest('button'));
    });
    
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
  
  test('handles API error gracefully', async () => {
    console.error = jest.fn(); // Mock console.error
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
    });
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching profile:', 
        expect.any(Error)
      );
    });
  });
});