import { motion } from 'framer-motion';
import { Home, Users, AlertTriangle, Clock, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavbarBottom = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'partners', icon: Users, label: 'Partners', path: '/partners' },
    { id: 'sos', icon: AlertTriangle, label: 'SOS', path: '/sos' },
    { id: 'history', icon: Clock, label: 'History', path: '/history' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10 px-4 py-2 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <motion.button
              key={tab.id}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'text-purple-400' : 'text-white/60'
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(tab.path)}
            >
              <motion.div
                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon className="w-6 h-6 mb-1" />
              </motion.div>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="absolute -top-1 w-1 h-1 bg-purple-400 rounded-full"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default NavbarBottom;