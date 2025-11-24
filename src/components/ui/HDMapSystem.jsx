import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Users, Shield, Navigation, Crosshair, Layers, Plus, Minus, 
  Locate, Route, MessageCircle, Menu, Search, Maximize, Settings 
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HDMapStyles.css';

// High-quality marker icons with retina support
const createHDMarkerIcon = (color, isUser = false, size = 'normal') => {
  const dimensions = {
    small: { width: 24, height: 24, iconSize: [24, 24] },
    normal: { width: 32, height: 32, iconSize: [32, 32] },
    large: { width: 40, height: 40, iconSize: [40, 40] }
  };
  
  const { width, height, iconSize } = dimensions[size];
  
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${width}px;
        height: ${height}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${width - 4}px;
          height: ${height - 4}px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background-image: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        ">
          <div style="
            width: ${width - 16}px;
            height: ${height - 16}px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${width > 30 ? '14px' : '12px'};
            font-weight: bold;
          ">
            ${isUser ? '📍' : '👤'}
          </div>
        </div>
        ${isUser ? `
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 10px solid ${color};
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          "></div>
        ` : ''}
      </div>
    `,
    className: 'hd-marker-icon',
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1] + (isUser ? 6 : 0)],
    popupAnchor: [0, -(iconSize[1] + (isUser ? 6 : 0))]
  });
};

// HD Map Tile Providers
const HD_MAP_PROVIDERS = {
  // High-quality OpenStreetMap with retina support
  osm_hd: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    tileSize: 256,
    zoomOffset: 0,
    detectRetina: true
  },
  
  // CartoDB Positron (Clean, high-quality)
  cartodb_positron: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 20,
    tileSize: 256,
    zoomOffset: 0,
    detectRetina: true,
    subdomains: 'abcd'
  },
  
  // Esri World Imagery (Satellite HD)
  esri_satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri © DigitalGlobe © GeoEye © Earthstar Geographics',
    maxZoom: 20,
    tileSize: 256,
    zoomOffset: 0,
    detectRetina: true
  },
  
  // Esri World Street Map (HD Streets)
  esri_streets: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri © OpenStreetMap contributors',
    maxZoom: 20,
    tileSize: 256,
    zoomOffset: 0,
    detectRetina: true
  },
  
  // OpenTopoMap (Terrain HD)
  topo_hd: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 17,
    tileSize: 256,
    zoomOffset: 0,
    detectRetina: true,
    subdomains: 'abc'
  }
};

const HDMapSystem = ({ 
  userLocation, 
  partners = [], 
  emergencyMode = false, 
  onLocationUpdate, 
  mapSettings = {},
  onSettingsChange,
  className = ""
}) => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [zoom, setZoom] = useState(15);
  const [mapStyle, setMapStyle] = useState(mapSettings.defaultStyle || 'cartodb_positron');
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  // HD Icons
  const userIcon = createHDMarkerIcon('#4285f4', true, 'large');
  const partnerIcon = createHDMarkerIcon('#34a853', false, 'normal');
  const emergencyIcon = createHDMarkerIcon('#ea4335', true, 'large');

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      if (mapSettings.autoCenter && mapRef.current) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], zoom);
      }
    }
  }, [userLocation, mapSettings.autoCenter]);

  useEffect(() => {
    if (mapSettings.defaultStyle && HD_MAP_PROVIDERS[mapSettings.defaultStyle]) {
      setMapStyle(mapSettings.defaultStyle);
    }
  }, [mapSettings.defaultStyle]);

  // Map Controls
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 17);
    }
  };

  const centerOnPartners = () => {
    if (partners.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(
        partners
          .filter(p => p.location)
          .map(p => [p.location.lat, p.location.lng])
      );
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
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
        mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
      }
    }
  };

  const currentProvider = HD_MAP_PROVIDERS[mapStyle] || HD_MAP_PROVIDERS.cartodb_positron;

  return (
    <div className={`relative w-full h-full bg-gray-50 ${className}`}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-[2000] flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading HD Map...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">SafeGuard Map</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Search locations..."
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none text-base"
              />
              <button className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors">
                <Crosshair className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HD Map Container */}
      <div className="absolute inset-0 pt-28 pb-20">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          className="w-full h-full"
          ref={mapRef}
          zoomControl={false}
          attributionControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          tap={true}
          tapTolerance={15}
          zoomSnap={0.25}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={60}
          preferCanvas={true}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
            
            // HD Map optimizations
            mapInstance.options.zoomAnimation = true;
            mapInstance.options.fadeAnimation = true;
            mapInstance.options.markerZoomAnimation = true;
            
            // Event handlers
            mapInstance.on('zoomend', () => {
              setZoom(mapInstance.getZoom());
            });
            
            mapInstance.on('load', () => {
              setIsLoading(false);
            });
            
            mapInstance.on('tileload', () => {
              setIsLoading(false);
            });
            
            // Force map resize for HD rendering
            setTimeout(() => {
              mapInstance.invalidateSize();
              setIsLoading(false);
            }, 300);
          }}
        >
          {/* HD Tile Layer */}
          <TileLayer
            url={currentProvider.url}
            attribution={currentProvider.attribution}
            maxZoom={currentProvider.maxZoom}
            tileSize={currentProvider.tileSize}
            zoomOffset={currentProvider.zoomOffset}
            detectRetina={currentProvider.detectRetina}
            subdomains={currentProvider.subdomains}
            crossOrigin={true}
            className="hd-tile-layer"
          />

          {/* User Location Marker */}
          {userLocation && (
            <>
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={emergencyMode ? emergencyIcon : userIcon}
              >
                <Popup className="hd-popup" closeButton={true} autoClose={false}>
                  <div className="p-4 min-w-[280px]">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 ${emergencyMode ? 'bg-red-500' : 'bg-blue-500'} rounded-full flex items-center justify-center shadow-md`}>
                        <span className="text-white text-lg">
                          {emergencyMode ? '🚨' : '📍'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">
                          {emergencyMode ? 'Emergency Location' : 'Your Location'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Share Location
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        Directions
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* HD Safety Radius */}
              {mapSettings.showSafetyRadius !== false && (
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={500}
                  pathOptions={{
                    color: emergencyMode ? '#ea4335' : '#4285f4',
                    fillColor: emergencyMode ? '#ea4335' : '#4285f4',
                    fillOpacity: 0.1,
                    weight: 2,
                    opacity: 0.8,
                    dashArray: emergencyMode ? '10, 5' : null
                  }}
                />
              )}
            </>
          )}

          {/* Partner Markers */}
          {mapSettings.showPartners !== false && partners.map((partner) => (
            partner.location && (
              <Marker
                key={partner.id}
                position={[partner.location.lat, partner.location.lng]}
                icon={partnerIcon}
              >
                <Popup className="hd-popup" closeButton={true} autoClose={false}>
                  <div className="p-4 min-w-[300px]">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{partner.name}</p>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            partner.status === 'online' ? 'bg-green-500' :
                            partner.status === 'sharing' ? 'bg-blue-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm text-gray-600 capitalize font-medium">
                            {partner.status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 font-medium">
                            {partner.safetyScore}% Safe
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center transition-colors">
                        <Route className="w-4 h-4 mr-2" />
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

      {/* Mobile Zoom Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col space-y-2">
        <motion.button
          onClick={zoomIn}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-6 h-6 text-gray-700" />
        </motion.button>
        
        <motion.button
          onClick={zoomOut}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Minus className="w-6 h-6 text-gray-700" />
        </motion.button>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-32 right-4 z-[1000] flex flex-col space-y-3">
        <motion.button
          onClick={centerOnUser}
          className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center active:bg-blue-600 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Locate className="w-7 h-7 text-white" />
        </motion.button>
        
        {emergencyMode && (
          <motion.button
            className="w-14 h-14 bg-red-500 rounded-full shadow-lg flex items-center justify-center animate-pulse"
            whileTap={{ scale: 0.9 }}
          >
            <Shield className="w-7 h-7 text-white" />
          </motion.button>
        )}
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-md border-t border-gray-200">
        <div className="p-4">
          {/* Map Style Selector */}
          <div className="flex space-x-2 mb-3 overflow-x-auto">
            {Object.entries({
              cartodb_positron: { name: 'Default', icon: '🗺️' },
              esri_streets: { name: 'Streets', icon: '🛣️' },
              esri_satellite: { name: 'Satellite', icon: '🛰️' },
              topo_hd: { name: 'Terrain', icon: '🏔️' }
            }).map(([key, { name, icon }]) => (
              <motion.button
                key={key}
                onClick={() => setMapStyle(key)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  mapStyle === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{icon}</span>
                {name}
              </motion.button>
            ))}
          </div>

          {/* Layer Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <motion.button
                onClick={() => {
                  const newSettings = { ...mapSettings, showPartners: !mapSettings.showPartners };
                  if (onSettingsChange) onSettingsChange(newSettings);
                }}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mapSettings.showPartners !== false 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-4 h-4 mr-2" />
                Partners
              </motion.button>

              <motion.button
                onClick={() => {
                  const newSettings = { ...mapSettings, showSafetyRadius: !mapSettings.showSafetyRadius };
                  if (onSettingsChange) onSettingsChange(newSettings);
                }}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mapSettings.showSafetyRadius !== false 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Safety Zone
              </motion.button>
            </div>

            <div className="flex space-x-2">
              {partners.length > 0 && (
                <motion.button
                  onClick={centerOnPartners}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-md"
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View All ({partners.length})
                </motion.button>
              )}
              
              <motion.button
                onClick={fitToView}
                className="p-3 bg-gray-100 rounded-full"
                whileTap={{ scale: 0.95 }}
              >
                <Maximize className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HDMapSystem;