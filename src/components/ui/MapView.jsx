import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import LocationShare from './LocationShare';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom CSS for enhanced popup styling
const customStyles = `
  .custom-popup .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .custom-popup .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ userLocation, partners = [] }) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const lastPositionRef = useRef(null);
  const MIN_DISTANCE_THRESHOLD = 0.0002;

  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 0;
    const R = 6371;
    const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const dLon = (pos2[1] - pos1[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocationSuccess = (pos) => {
    const { latitude, longitude } = pos.coords;
    const newPosition = [latitude, longitude];

    if (!lastPositionRef.current || calculateDistance(lastPositionRef.current, newPosition) > MIN_DISTANCE_THRESHOLD) {
      lastPositionRef.current = newPosition;
      setPosition(newPosition);
      setError(null);
    }
  };

  const handleLocationError = (err) => {
    let errorMessage = "Location access required";
    switch(err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = "Location access denied. Please enable location permissions.";
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = "Location unavailable. Check GPS/network connection.";
        break;
      case err.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
    }
    setError(errorMessage);
  };

  useEffect(() => {
    if (userLocation) {
      setPosition([userLocation.lat, userLocation.lng]);
      return;
    }

    let watchId = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
      watchId = navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      });
    } else {
      setError('Geolocation not supported');
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userLocation]);

  // Convert position format for LocationShare
  const locationForShare = position ? { lat: position[0], lng: position[1] } : null;

  if (error) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Location Access Required</h3>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛰</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Acquiring Signal</h3>
          <p className="text-cyan-400 text-sm">Connecting to GPS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Map Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Glassmorphism Header */}
        <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">🗺️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Live Location</h2>
                  <p className="text-white/60 text-sm">Real-time GPS tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-green-500/20 border border-green-400/30 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-semibold tracking-wide">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container with Enhanced Styling */}
        <div className="relative h-96 md:h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
          <MapContainer
            center={position}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            doubleClickZoom={true}
            touchZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            className="rounded-b-3xl"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            <Marker position={position}>
              <Popup className="custom-popup">
                <div className="text-center p-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm">📍</span>
                  </div>
                  <strong className="text-gray-800 block mb-1">Your Location</strong>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Lat: {position[0].toFixed(6)}</div>
                    <div>Lng: {position[1].toFixed(6)}</div>
                    <div className="text-green-600 font-medium">● Live</div>
                  </div>
                </div>
              </Popup>
            </Marker>
            {partners.map((partner) => (
              partner.location && (
                <Marker key={partner.id} position={[partner.location.lat, partner.location.lng]}>
                  <Popup>
                    <div className="text-center p-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-sm">👤</span>
                      </div>
                      <strong className="text-gray-800 block mb-1">{partner.name}</strong>
                      <div className="text-xs text-gray-600">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          partner.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        {partner.status}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
          <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200 hover:scale-105">
            <span className="text-gray-700 text-lg">📍</span>
          </button>
          <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200 hover:scale-105">
            <span className="text-gray-700 text-lg">🔄</span>
          </button>
        </div>
      </div>
      
      <LocationShare userLocation={locationForShare} />
    </div>
  );
};

export default MapView;