export const API_URL = "http://localhost:5176/api";

// In your api.js
export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    // First check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Server returned non-JSON response');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error; // Re-throw to be caught in your component
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log(`Attempting login for ${email} to ${API_URL}/auth/login`);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    console.log("Login response status:", response.status);
    const data = await response.json();
    console.log("Login response data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Notes Functions (direct exports)
export const getAllNotes = async (token) => {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notes');
    }

    return await response.json();
  } catch (error) {
    console.error('Get notes error:', error.message);
    throw error;
  }
};

export const getNoteById = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Note not found');
    }

    return await response.json();
  } catch (error) {
    console.error('Get note by ID error:', error.message);
    throw error;
  }
};

export const createNote = async (noteData, token) => {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create note');
    }

    return await response.json();
  } catch (error) {
    console.error('Create note error:', error.message);
    throw error;
  }
};

export const updateNote = async (id, noteData, token) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update note');
    }

    return await response.json();
  } catch (error) {
    console.error('Update note error:', error.message);
    throw error;
  }
};

export const deleteNote = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete note');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete note error:', error.message);
    throw error;
  }
};
