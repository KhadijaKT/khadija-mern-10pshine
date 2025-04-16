import { colors } from '../../styles/Themes';
//import logo from '../../assets/logo.png'; // or use any working method above

const Header = ({ children }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
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
        <img 
          src="../assets/logo" 
          alt="Note App Logo" 
          style={{ 
            height: '40px',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
        <h1 style={{ margin: 0 }}>Notes</h1>
      </div>
      {children}
    </header>
  );
};

export default Header;