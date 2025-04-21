import { colors } from '../../styles/Themes';
//import { FaRegStickyNote } from 'react-icons/fa'; 
//import { RiStickyNoteFill } from 'react-icons/ri'; 
import { MdOutlineNotes } from 'react-icons/md'; 

const Header = ({ children }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between', // Ensures proper spacing
      padding: '1rem 2rem',
      backgroundColor: colors.secondary,
      color: colors.primary,
      boxShadow: `0 2px 4px ${colors.dark}20`,
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Replaced logo with notes icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
          width: '40px',
          borderRadius: '8px',
          backgroundColor: colors.primary,
          color: colors.secondary,
          padding: '0.5rem'
        }}>
          <MdOutlineNotes size={24} />
        </div>
        <h1 style={{ 
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>Notes</h1>
      </div>
      {children}
    </header>
  );
};

export default Header;
