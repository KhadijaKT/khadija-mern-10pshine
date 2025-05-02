import { 
    registerUser, 
    loginUser, 
    getAllNotes, 
    getNoteById, 
    createNote, 
    updateNote, 
    deleteNote,
    API_URL 
  } from '../utils/api'; 
  
  global.fetch = jest.fn();
  
  describe('API Functions', () => {
    beforeEach(() => {
      fetch.mockClear();
    });
  
    // Auth Tests
    describe('Authentication Functions', () => {
      test('registerUser makes correct fetch call and returns data on success', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ user: { name: 'Test User' }, token: 'test-token' }),
          headers: { get: jest.fn().mockReturnValue('application/json') }
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await registerUser('Test User', 'test@example.com', 'password123');
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: 'Test User', 
            email: 'test@example.com', 
            password: 'password123' 
          })
        });
        
        expect(result).toEqual({ user: { name: 'Test User' }, token: 'test-token' });
      });
  
      test('registerUser handles server errors', async () => {
        const errorMessage = 'Email already in use';
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: errorMessage }),
          headers: { get: jest.fn().mockReturnValue('application/json') }
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(registerUser('Test User', 'test@example.com', 'password123'))
          .rejects.toThrow(errorMessage);
      });
  
      test('registerUser handles non-JSON responses', async () => {
        const mockResponse = {
          ok: false,
          text: jest.fn().mockResolvedValue('Internal Server Error'),
          headers: { get: jest.fn().mockReturnValue('text/plain') }
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(registerUser('Test User', 'test@example.com', 'password123'))
          .rejects.toThrow('Internal Server Error');
      });
  
      test('loginUser makes correct fetch call and returns data on success', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ user: { email: 'test@example.com' }, token: 'test-token' }),
          status: 200
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await loginUser('test@example.com', 'password123');
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          credentials: 'include'
        });
        
        expect(result).toEqual({ user: { email: 'test@example.com' }, token: 'test-token' });
      });
  
      test('loginUser handles invalid credentials', async () => {
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: 'Invalid credentials' }),
          status: 401
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(loginUser('wrong@example.com', 'wrong-password'))
          .rejects.toThrow('Invalid credentials');
      });
    });
  
    // Notes Tests
    describe('Note Functions', () => {
      const mockToken = 'test-token';
      const mockNote = { title: 'Test Note', content: 'Test content' };
      const mockNoteId = '123';
  
      test('getAllNotes makes correct fetch call and returns data', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue([mockNote])
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await getAllNotes(mockToken);
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/notes`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        expect(result).toEqual([mockNote]);
      });
  
      test('getAllNotes handles errors', async () => {
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: 'Failed to fetch notes' })
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(getAllNotes(mockToken))
          .rejects.toThrow('Failed to fetch notes');
      });
  
      test('getNoteById makes correct fetch call and returns data', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue(mockNote)
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await getNoteById(mockNoteId, mockToken);
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/notes/${mockNoteId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        expect(result).toEqual(mockNote);
      });
  
      test('getNoteById handles not found errors', async () => {
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: 'Note not found' })
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(getNoteById('invalid-id', mockToken))
          .rejects.toThrow('Note not found');
      });
  
      test('createNote makes correct fetch call and returns data', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ ...mockNote, _id: mockNoteId })
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await createNote(mockNote, mockToken);
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockNote)
        });
        
        expect(result).toEqual({ ...mockNote, _id: mockNoteId });
      });
  
      test('createNote handles errors', async () => {
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: 'Failed to create note' })
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(createNote(mockNote, mockToken))
          .rejects.toThrow('Failed to create note');
      });
  
      test('updateNote makes correct fetch call and returns data', async () => {
        const updatedNote = { ...mockNote, title: 'Updated Title' };
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ ...updatedNote, _id: mockNoteId })
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await updateNote(mockNoteId, updatedNote, mockToken);
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/notes/${mockNoteId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedNote)
        });
        
        expect(result).toEqual({ ...updatedNote, _id: mockNoteId });
      });
  
      test('updateNote handles errors', async () => {
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: 'Failed to update note' })
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(updateNote(mockNoteId, mockNote, mockToken))
          .rejects.toThrow('Failed to update note');
      });
  
      test('deleteNote makes correct fetch call and returns data', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ message: 'Note deleted' })
        };
        
        fetch.mockResolvedValue(mockResponse);
        
        const result = await deleteNote(mockNoteId, mockToken);
        
        expect(fetch).toHaveBeenCalledWith(`${API_URL}/notes/${mockNoteId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          }
        });
        
        expect(result).toEqual({ message: 'Note deleted' });
      });
  
      test('deleteNote handles errors', async () => {
        const mockResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({ message: 'Failed to delete note' })
        };
  
        fetch.mockResolvedValue(mockResponse);
        
        await expect(deleteNote(mockNoteId, mockToken))
          .rejects.toThrow('Failed to delete note');
      });
    });
  
    // Test network failure case
    test('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      await expect(getAllNotes('test-token'))
        .rejects.toThrow('Network error');
    });
  });