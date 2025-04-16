import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles/Themes';
import Header from '../components/layout/Header';
import AddNoteButton from '../components/notes/addNote';
import NoteBlock from '../components/notes/noteBlock';
import NoteColorPicker from '../components/notes/noteColorPicker';
import { FiSearch, FiUser, FiPlus, FiFrown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('http://localhost:5176/api/notes', { headers });
        setNotes(response.data);
      } catch (err) {
        console.error('Failed to fetch notes:', err.response ? err.response.data : err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addNote = async (color) => {
    const newNote = {
      title: 'New Note',
      content: 'Start writing...',
      fontFamily: 'Arial', // default font, can be updated from NoteBlock
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      backgroundColor: color || '#ffffff',
      textColor: '#000000',
    };

    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('http://localhost:5176/api/notes', newNote, { headers });
      setNotes((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to add note:', err.response ? err.response.data : err);
    }

    setShowColorPicker(false);
  };

  const deleteNote = async (id) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`http://localhost:5176/api/notes/${id}`, { headers });
      setNotes(prev => prev.filter(note => note._id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err.response ? err.response.data : err);
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`http://localhost:5176/api/notes/${updatedNote._id}`, updatedNote, { headers });
      setNotes(prev =>
        prev.map(note => note._id === updatedNote._id ? updatedNote : note)
      );
    } catch (err) {
      console.error('Failed to update note:', err.response ? err.response.data : err);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <div style={{
      backgroundColor: colors.primary,
      minHeight: '100vh',
      paddingBottom: '2rem'
    }}>
      <Header>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            marginLeft: 'auto',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            backgroundColor: colors.secondary + '20',
            color: colors.dark
          }}
        >
          <FiUser size={20} />
          {windowWidth > 768 && <span>Profile</span>}
        </motion.div>
      </Header>

      <div style={{
        padding: windowWidth > 768 ? '2rem' : '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          flexDirection: windowWidth < 600 ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {windowWidth < 600 && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <AddNoteButton onClick={() => setShowColorPicker(true)} />
            </div>
          )}

          <div style={{
            position: 'relative',
            flexGrow: 1,
            width: '100%',
            maxWidth: windowWidth < 600 ? '100%' : '500px',
            margin: windowWidth < 600 ? '0' : '0 auto'
          }}>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '25px',
                border: `1px solid ${colors.secondary}`,
                backgroundColor: colors.primary,
                color: colors.dark,
                fontSize: '1rem',
                outline: 'none',
                boxShadow: `0 2px 4px rgba(0,0,0,0.1)`,
                transition: 'all 0.3s ease'
              }}
            />
            <FiSearch style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.secondary,
              fontSize: '1.2rem'
            }} />
          </div>

          {windowWidth >= 600 && (
            <AddNoteButton onClick={() => setShowColorPicker(true)} />
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              width: '100%',
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: colors.secondary
            }}
          >
            <FiFrown size={48} />
            <h3>No notes found</h3>
            <p>
              {searchQuery ? 'Try a different search term' : 'Create your first note!'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowColorPicker(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  backgroundColor: colors.secondary,
                  color: colors.dark,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginTop: '1rem'
                }}
              >
                <FiPlus /> Add Note
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth < 600 ? '1fr' :
              windowWidth < 900 ? 'repeat(2, 1fr)' :
                'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            marginTop: '1rem'
          }}>
            <AnimatePresence>
              {filteredNotes.map(note => (
                <NoteBlock
                  key={note._id}
                  note={note}
                  onDelete={() => deleteNote(note._id)}
                  onUpdate={updateNote}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {showColorPicker && (
        <NoteColorPicker
          onSelect={addNote}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
};

export default Home;
