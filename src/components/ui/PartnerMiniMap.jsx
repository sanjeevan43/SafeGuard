import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom partner icon
const createPartnerIcon = (color) => {
  return L.divIcon({
    html: `<div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 10px;">📍</span>
    </div>`,
    className: 'partner-mini-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const PartnerMiniMap = ({ partner, isExpanded = false, onToggleExpand }) => {
  const [mapStyle, setMapStyle] = useState('street');
  const mapRef = useRef(null);

  const mapStyles = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  const partnerIcon = createPartnerIcon('#3b82f6');

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [isExpanded]);

  const centerOnPartner = () => {
    if (partner.location && mapRef.current) {
      mapRef.current.setView([partner.location.lat, partner.location.lng], 16);
    }
  };

  if (!partner.location) {
    return (
      <div className="bg-white/10 rounded-lg p-4 text-center">
        <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
        <p className="text-white/60 text-sm">Location not available</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white/10 rounded-lg overflow-hidden border border-white/20"
      layout
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-3 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-white font-medium text-sm">{partner.name}</span>
          <div className={`w-2 h-2 rounded-full ${
            partner.status === 'online' ? 'bg-green-400' :
            partner.status === 'sharing' ? 'bg-blue-400' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={centerOnPartner}
            className="p-1 hover:bg-white/10 rounded"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Center on partner"
          >
            <Navigation className="w-3 h-3 text-white/60" />
          </motion.button>
          
          <motion.button
            onClick={onToggleExpand}
            className="p-1 hover:bg-white/10 rounded"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3 text-white/60" />
            ) : (
              <Maximize2 className="w-3 h-3 text-white/60" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Map */}
      <div className={`relative ${isExpanded ? 'h-48' : 'h-24'} transition-all duration-300`}>
        <MapContainer
          center={[partner.location.lat, partner.location.lng]}
          zoom={isExpanded ? 15 : 13}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={isExpanded}
          dragging={isExpanded}
          touchZoom={isExpanded}
          doubleClickZoom={isExpanded}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            url={mapStyles[mapStyle]}
            attribution={mapStyle === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
          />
          
          <Marker position={[partner.location.lat, partner.location.lng]} icon={partnerIcon}>
            <Popup>
              <div className="text-center">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-8 h-8 rounded-full mx-auto mb-1"
                />
                <p className="font-semibold">{partner.name}</p>
                <p className="text-xs text-gray-600 capitalize">{partner.status}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Map Style Toggle (only when expanded) */}
        {isExpanded && (
          <div className="absolute top-2 right-2 z-[1000]">
            <div className="bg-black/70 rounded p-1">
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="bg-transparent text-white text-xs border-none outline-none"
              >
                <option value="street" className="bg-black">Street</option>
                <option value="satellite" className="bg-black">Satellite</option>
                <option value="dark" className="bg-black">Dark</option>
              </select>
            </div>
          </div>
        )}

        {/* Distance Info */}
        <div className="absolute bottom-2 left-2 z-[1000]">
          <div className="bg-black/70 rounded px-2 py-1">
            <p className="text-white text-xs">
              📍 {partner.location.lat.toFixed(3)}, {partner.location.lng.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-white/5 text-xs text-white/60">
        <div className="flex justify-between items-center">
          <span>Last seen: {partner.lastSeen}</span>
          <span className="capitalize">{partner.status}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PartnerMiniMap;