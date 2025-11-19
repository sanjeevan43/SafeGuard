import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Users, Shield, Navigation, Crosshair, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 14px;">${icon}</span>
    </div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const userIcon = createCustomIcon('#8b5cf6', '👤');
const partnerIcon = createCustomIcon('#3b82f6', '👥');
const emergencyIcon = createCustomIcon('#ef4444', '🚨');

const MapSystem = ({ userLocation, partners = [], emergencyMode = false, onLocationUpdate }) => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [zoom, setZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('street');
  const mapRef = useRef(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  const mapStyles = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
    }
  };

  const centerOnPartners = () => {
    if (partners.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(partners.map(p => [p.location.lat, p.location.lng]));
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <motion.button
          onClick={centerOnUser}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-md border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Crosshair className="w-5 h-5 text-white" />
        </motion.button>
        
        <motion.button
          onClick={centerOnPartners}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-md border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Users className="w-5 h-5 text-white" />
        </motion.button>

        <div className="relative">
          <motion.button
            className="p-3 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-md border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Layers className="w-5 h-5 text-white" />
          </motion.button>
          
          <div className="absolute right-full mr-2 top-0 bg-black/80 rounded-lg p-2 space-y-1 backdrop-blur-md">
            {Object.keys(mapStyles).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`block w-full text-left px-3 py-2 rounded text-sm capitalize ${
                  mapStyle === style ? 'bg-purple-600 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Stats */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-4 text-white text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>You</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>{partners.length} Partners</span>
            </div>
            {emergencyMode && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span>Emergency</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full z-0"
        ref={mapRef}
        zoomControl={false}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          setTimeout(() => mapInstance.invalidateSize(), 100);
        }}
      >
        <TileLayer
          url={mapStyles[mapStyle]}
          attribution={mapStyle === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
        />

        {/* User Location */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup className="custom-popup">
                <div className="text-center p-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <p className="font-semibold text-white">Your Location</p>
                  <p className="text-xs text-white/80">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {/* Safety radius */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={500}
              pathOptions={{
                color: emergencyMode ? '#ef4444' : '#8b5cf6',
                fillColor: emergencyMode ? '#ef4444' : '#8b5cf6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: emergencyMode ? '5, 5' : null
              }}
            />
          </>
        )}

        {/* Partner Locations */}
        {partners.map((partner) => (
          partner.location && (
            <Marker
              key={partner.id}
              position={[partner.location.lat, partner.location.lng]}
              icon={partnerIcon}
            >
              <Popup className="custom-popup">
                <div className="text-center p-2">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                  />
                  <p className="font-semibold text-white">{partner.name}</p>
                  <p className="text-xs text-white/80 capitalize">{partner.status}</p>
                  <div className="flex items-center justify-center mt-1">
                    <Shield className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">{partner.safetyScore}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapSystem;