import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const SOSFloatingButton = ({ onClick }) => {
  return (
    <motion.button
      className="fixed bottom-20 right-6 w-16 h-16 bg-red-600 rounded-full shadow-2xl z-50 flex items-center justify-center animate-pulse-glow"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ 
        boxShadow: [
          '0 0 20px rgba(239, 68, 68, 0.5)',
          '0 0 40px rgba(239, 68, 68, 0.8)',
          '0 0 20px rgba(239, 68, 68, 0.5)'
        ]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      onClick={onClick}
    >
      <AlertTriangle className="w-8 h-8 text-white" />
    </motion.button>
  );
};

export default SOSFloatingButton;