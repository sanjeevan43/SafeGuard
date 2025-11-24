import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Shield, Navigation, Crosshair, Layers, Plus, Minus, ZoomIn, ZoomOut, Maximize, Menu, Search, Locate, Route, MessageCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Google Maps style marker icons
const createGoogleStyleIcon = (color, isUser = false) => {
  const size = isUser ? 40 : 32;
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${size - 8}px;
          height: ${size - 8}px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: ${size - 20}px;
            height: ${size - 20}px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isUser ? '16px' : '12px'};
          ">
            ${isUser ? '📍' : '👥'}
          </div>
        </div>
        ${isUser ? `
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid ${color};
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          "></div>
        ` : ''}
      </div>
    `,
    className: 'google-style-marker',
    iconSize: [size, size + (isUser ? 12 : 0)],
    iconAnchor: [size / 2, size + (isUser ? 12 : 0)]
  });
};

const userIcon = createGoogleStyleIcon('#4285f4', true);
const partnerIcon = createGoogleStyleIcon('#34a853', false);
const emergencyIcon = createGoogleStyleIcon('#ea4335', true);

const MapSystem = ({ userLocation, partners = [], emergencyMode = false, onLocationUpdate, mapSettings = {}, onSettingsChange }) => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [zoom, setZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState(mapSettings.defaultStyle || 'street');
  const mapRef = useRef(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      if (mapSettings.autoCenter && mapRef.current) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], zoom);
      }
    }
  }, [userLocation, mapSettings.autoCenter]);

  useEffect(() => {
    if (mapSettings.defaultStyle) {
      setMapStyle(mapSettings.defaultStyle);
    }
  }, [mapSettings.defaultStyle]);

  const mapStyles = {
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap contributors'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB'
    }
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

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const fitToView = () => {
    if (mapRef.current) {
      if (partners.length > 0) {
        centerOnPartners();
      } else if (userLocation) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
      }
    }
  };

  const zoomToLevel = (level) => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], level);
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-100">
      {/* Mobile Google Maps Style Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-white shadow-lg">
        <div className="p-4">
          {/* Top Row - Menu and Profile */}
          <div className="flex items-center justify-between mb-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
            </div>
          </div>
          
          {/* Search Bar - Mobile Style */}
          <div className="relative mb-3">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Search here"
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none text-base"
              />
              <button className="ml-2 p-1">
                <Crosshair className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Zoom Controls - Right Side */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col space-y-2">
        <motion.button
          onClick={zoomIn}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
          title="Zoom in"
        >
          <Plus className="w-6 h-6 text-gray-700" />
        </motion.button>
        
        <motion.button
          onClick={zoomOut}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
          title="Zoom out"
        >
          <Minus className="w-6 h-6 text-gray-700" />
        </motion.button>
      </div>

      {/* Mobile Floating Action Buttons */}
      <div className="absolute bottom-32 right-4 z-[1000] flex flex-col space-y-3">
        {/* My Location Button */}
        <motion.button
          onClick={centerOnUser}
          className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center active:bg-blue-600 transition-colors mobile-map-button"
          whileTap={{ scale: 0.9 }}
          title="My location"
        >
          <Locate className="w-7 h-7 text-white" />
        </motion.button>
        
        {/* Emergency Mode Toggle */}
        {emergencyMode && (
          <motion.button
            className="w-14 h-14 bg-red-500 rounded-full shadow-lg flex items-center justify-center animate-pulse mobile-map-button"
            whileTap={{ scale: 0.9 }}
            title="Emergency mode active"
          >
            <Shield className="w-7 h-7 text-white" />
          </motion.button>
        )}
        
        {/* Quick Share Location */}
        <motion.button
          className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center active:bg-gray-100 transition-colors mobile-map-button"
          whileTap={{ scale: 0.9 }}
          title="Share location"
        >
          <Navigation className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* Mobile Bottom Sheet Style Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]">
        {/* Map Type Selector - Floating */}
        <div className="absolute bottom-20 left-4">
          <div className="bg-white rounded-full shadow-lg p-1 flex space-x-1">
            {[
              { key: 'street', label: 'Map', icon: '🗺️' },
              { key: 'satellite', label: 'Satellite', icon: '🛰️' },
              { key: 'terrain', label: 'Terrain', icon: '🏔️' }
            ].map(({ key, label, icon }) => (
              <motion.button
                key={key}
                onClick={() => setMapStyle(key)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                  mapStyle === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bottom Control Panel */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Layer Controls */}
            <div className="flex space-x-3">
              <motion.button
                onClick={() => {
                  const newSettings = { ...mapSettings, showPartners: !mapSettings.showPartners };
                  if (onSettingsChange) onSettingsChange(newSettings);
                }}
                className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  mapSettings.showPartners !== false 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-4 h-4 mr-1" />
                Partners
              </motion.button>

              <motion.button
                onClick={() => {
                  const newSettings = { ...mapSettings, showSafetyRadius: !mapSettings.showSafetyRadius };
                  if (onSettingsChange) onSettingsChange(newSettings);
                }}
                className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  mapSettings.showSafetyRadius !== false 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-4 h-4 mr-1" />
                Safety
              </motion.button>
            </div>

            {/* Right Side - View Controls */}
            <div className="flex space-x-2">
              {partners.length > 0 && (
                <motion.button
                  onClick={centerOnPartners}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-md mobile-map-button"
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View All ({partners.length})
                </motion.button>
              )}
              
              <motion.button
                onClick={fitToView}
                className="p-3 bg-gray-100 rounded-full mobile-map-button"
                whileTap={{ scale: 0.95 }}
                title="Fit to view"
              >
                <Maximize className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>



      {/* Map Container - Mobile Optimized */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full z-0"
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        tap={true}
        tapTolerance={15}
        zoomSnap={0.5}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={60}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          
          // Mobile-specific map settings
          mapInstance.options.zoomAnimation = true;
          mapInstance.options.fadeAnimation = true;
          mapInstance.options.markerZoomAnimation = true;
          
          // Add mobile gesture handling
          mapInstance.on('zoomend', () => {
            setZoom(mapInstance.getZoom());
          });
          
          setTimeout(() => mapInstance.invalidateSize(), 100);
        }}
      >
        <TileLayer
          url={mapStyles[mapStyle].url}
          attribution={mapStyles[mapStyle].attribution}
        />

        {/* User Location */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup className="mobile-popup" closeButton={true} autoClose={false}>
                <div className="p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📍</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Your Location</p>
                      <p className="text-xs text-gray-500">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      Share Location
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {/* Safety radius */}
            {mapSettings.showSafetyRadius !== false && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={500}
                pathOptions={{
                  color: emergencyMode ? '#ea4335' : '#4285f4',
                  fillColor: emergencyMode ? '#ea4335' : '#4285f4',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: emergencyMode ? '10, 5' : null
                }}
              />
            )}
          </>
        )}

        {/* Partner Locations */}
        {mapSettings.showPartners !== false && partners.map((partner) => (
          partner.location && (
            <Marker
              key={partner.id}
              position={[partner.location.lat, partner.location.lng]}
              icon={partnerIcon}
            >
              <Popup className="mobile-popup" closeButton={true} autoClose={false}>
                <div className="p-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{partner.name}</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          partner.status === 'online' ? 'bg-green-500' :
                          partner.status === 'sharing' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-gray-600 capitalize">{partner.status}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Shield className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 font-medium">{partner.safetyScore}% Safe</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center">
                      <Route className="w-4 h-4 mr-1" />
                      Route
                    </button>
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