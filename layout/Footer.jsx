import React from 'react';
import { colors } from '../../styles/Themes';

const Footer = () => {
  return (
    <footer style={{
      padding: '1rem 2rem',
      backgroundColor: colors.secondary,
      color: colors.primary,
      textAlign: 'center',
      boxShadow: `0 -2px 4px ${colors.dark}20`,
      position: 'sticky',
      bottom: 0,
      zIndex: 50
    }}>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} Notes App — Built with ❤️ using MERN Stack
      </p>
    </footer>
  );
};

export default Footer;
