import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('../components/notes/addNote', () => () => (
  <button data-testid="add-note-button">Add Note</button>
));

jest.mock('../components/notes/noteBlock', () => ({ note }) => (
  <div data-testid="note-block">
    <h3>{note.title}</h3>
    <p>{note.content}</p>
  </div>
));

jest.mock('../components/notes/noteColorPicker', () => ({ onSelect, onClose }) => (
  <div data-testid="note-color-picker">
    <button onClick={() => onSelect('#ffffff')} data-testid="color-option">White</button>
    <button onClick={onClose}>Close</button>
  </div>
));

jest.mock('../components/layout/Header', () => ({ children }) => (
  <header data-testid="header">{children}</header>
));

jest.mock('../components/layout/Footer', () => () => (
  <footer data-testid="footer">Footer</footer>
));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

jest.mock('react-icons/fi', () => ({
  FiSearch: () => <span>Search</span>,
  FiUser: () => <span>User</span>,
  FiPlus: () => <span>Plus</span>,
  FiFrown: () => <span>Frown</span>
}));

jest.mock('axios');

import Home from '../pages/Home';

describe('Home Component', () => {
  const mockNotes = [
    {
      _id: '1',
      title: 'Test Note 1',
      content: 'This is test content 1',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Arial',
      isBold: false,
      isItalic: false,
      isUnderlined: false
    },
    {
      _id: '2',
      title: 'Test Note 2',
      content: 'This is test content 2',
      backgroundColor: '#ffff00',
      textColor: '#000000',
      fontFamily: 'Arial',
      isBold: true,
      isItalic: false,
      isUnderlined: true
    }
  ];

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
    
    axios.get.mockResolvedValue({ data: mockNotes });
    axios.post.mockResolvedValue({ data: { _id: '3', title: 'New Note' } });
    axios.delete.mockResolvedValue({});
    axios.put.mockResolvedValue({});
  });
  
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });
  
  test('fetches notes on mount', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5176/api/notes',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });
  
  test('search functionality works', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    fireEvent.change(searchInput, { target: { value: 'Test Note 1' } });
    
    expect(searchInput.value).toBe('Test Note 1');
  });
});