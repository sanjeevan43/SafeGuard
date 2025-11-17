import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Shield } from 'lucide-react';

const PartnerCard = ({ partner, onClick, onMessage, userLocation, calculateDistance }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'sharing': return 'bg-blue-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'sharing': return '📍';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'sharing': return 'Live Sharing';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <motion.div
      className="glass-card p-4 hover:bg-white/20 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(partner.status)} rounded-full border-2 border-white flex items-center justify-center text-xs`}>
            {getStatusIcon(partner.status)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{partner.name}</h3>
          <p className="text-sm text-white/60">{getStatusText(partner.status)}</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-white/40">{partner.lastSeen}</p>
            {partner.location && userLocation && calculateDistance && (
              <p className="text-xs text-blue-400">
                • {calculateDistance(partner.location)?.toFixed(1) || '0.0'} km
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {partner.isSharing && (
            <div className="flex items-center text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
          )}
          
          <div className="flex items-center text-green-400">
            <Shield className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{partner.safetyScore}</span>
          </div>
          
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMessage && onMessage(partner);
            }}
          >
            <MessageCircle className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PartnerCard;