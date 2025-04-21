import { colors } from '../../styles/Themes';
import { motion } from 'framer-motion';

const AddNoteButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: 'transparent',
        border: `2px dashed ${colors.secondary}`,
        color: colors.dark,
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginLeft: '1rem',
        marginTop: '1rem'
      }}
    >
      <motion.span 
        style={{ 
          fontSize: '24px',
          color: colors.secondary
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        +
      </motion.span>
    </motion.button>
  );
};

export default AddNoteButton;