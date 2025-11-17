import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      className={`glass-card p-6 ${hover ? 'hover:bg-white/20 cursor-pointer' : ''} ${className}`}
      whileHover={hover ? { scale: 1.02, rotateY: 5 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;