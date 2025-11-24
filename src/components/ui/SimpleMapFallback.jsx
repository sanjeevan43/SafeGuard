import { motion } from 'framer-motion';
import { MapPin, Users, Navigation } from 'lucide-react';

const SimpleMapFallback = ({ userLocation, partners = [] }) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>
      </div>

      {/* User Location */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="relative">
          <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            You are here
          </div>
        </div>
      </motion.div>

      {/* Partner Locations */}
      {partners.slice(0, 3).map((partner, index) => (
        <motion.div
          key={partner.id}
          className="absolute"
          style={{
            top: `${30 + index * 15}%`,
            left: `${25 + index * 20}%`
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, delay: index * 0.5, repeat: Infinity }}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
              {partner.name?.split(' ')[0] || 'Partner'}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4" />
          <span>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Status */}
      <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span>Demo Map View</span>
        </div>
      </div>

      {/* Partner Count */}
      {partners.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-400" />
            <span>{partners.length} Partners</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMapFallback;