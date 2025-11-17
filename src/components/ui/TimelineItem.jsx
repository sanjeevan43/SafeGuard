import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle, AlertTriangle, Share2 } from 'lucide-react';

const TimelineItem = ({ item, index }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'sos': return AlertTriangle;
      case 'check-in': return CheckCircle;
      case 'location-share': return Share2;
      default: return MapPin;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'sos': return 'text-red-400 bg-red-400/20';
      case 'check-in': return 'text-green-400 bg-green-400/20';
      case 'location-share': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-purple-400 bg-purple-400/20';
    }
  };

  const Icon = getIcon(item.type);
  const colorClass = getColor(item.type);

  return (
    <motion.div
      className="flex items-start space-x-4 pb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={`p-3 rounded-full ${colorClass} flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white capitalize">{item.type.replace('-', ' ')}</h4>
            <span className="text-sm text-white/60">
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-white/80 mb-2">{item.description}</p>
          
          <div className="flex items-center text-sm text-white/60">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{item.location}</span>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-white/60">
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(item.date).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineItem;