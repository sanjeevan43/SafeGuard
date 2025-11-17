import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Shield className="w-16 h-16 text-purple-400 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gradient mb-2">SafeGuard</h2>
        <p className="text-white/60">Loading your safety dashboard...</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;