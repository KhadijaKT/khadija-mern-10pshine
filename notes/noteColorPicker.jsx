import { colors } from '../../styles/Themes';
import { motion, AnimatePresence } from 'framer-motion';

const NoteColorPicker = ({ onSelect, onClose }) => {
  const colorOptions = Object.entries(colors.noteColors);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.primary,
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: `0 4px 8px ${colors.dark}`
          }}
        >
          <h3 style={{ color: colors.dark, marginBottom: '1.5rem' }}>
            Choose Note Color
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            {colorOptions.map(([name, color]) => (
              <motion.div
                key={name}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: color,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: `2px solid ${colors.secondary}`
                }}
                onClick={() => onSelect(color)}
                title={name}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoteColorPicker;