import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import LocationShare from './LocationShare';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Main MapView component
const MapView = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const lastPositionRef = useRef(null);
  const positionTimeoutRef = useRef(null);
  const MIN_DISTANCE_THRESHOLD = 0.0002; // About 20-25 meters (better for mobile)

  // Function to calculate distance between two coordinates
  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 0;
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const dLon = (pos2[1] - pos1[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Function to handle location success
  const handleLocationSuccess = async (pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const newPosition = [latitude, longitude];

    // Only update if position changed significantly or no previous position
    if (!lastPositionRef.current || calculateDistance(lastPositionRef.current, newPosition) > MIN_DISTANCE_THRESHOLD) {
      // Clear any existing timeout
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }

      // Set a small delay to prevent rapid updates
      positionTimeoutRef.current = setTimeout(() => {
        lastPositionRef.current = newPosition;
        setPosition(newPosition);
        setError(null);
      }, 1000); // 1 second delay
    }
  };

  // Function to handle location error
  const handleLocationError = (err) => {
    let errorMessage = err.message;

    switch(err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = "Location access denied by user. Please enable location permissions in your browser settings.";
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable. Please check your GPS/network connection.";
        break;
      case err.TIMEOUT:
        errorMessage = "Location request timed out. Please try again.";
        break;
      default:
        errorMessage = "An unknown location error occurred. Please try again.";
    }

    setError(errorMessage);
    setPosition(null);
  };

  // Use useEffect to request location permission and watch position
  useEffect(() => {
    let watchId = null;
    
    // Request current position first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);

      // Watch for position changes
      watchId = navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000, // Allow more caching to reduce frequent updates
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Location Access Required</h3>
            <p className="text-red-400 text-sm mb-1">{error}</p>
            <p className="text-gray-400 text-xs mb-4">Enable GPS access and location permissions to start tracking</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium text-sm"
              >
                Retry Location Access
              </button>
              <button
                onClick={() => navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium text-sm"
              >
                Get Current Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 pulse-glow">
              <span className="text-2xl">🛰</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Acquiring Signal</h3>
            <p className="text-cyan-400 text-sm mb-3">Connecting to GPS satellites...</p>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Your Location Card */}
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500/20 to-cyan-400/20 border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">🗺️</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">Your Position</h2>
                <p className="text-gray-400 text-xs">GPS tracking active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">LIVE</span>
              <button
                onClick={() => navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError)}
                className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                title="Refresh Location"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
        <div className="h-48 lg:h-80">
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            key={`map-${Math.floor(position[0] * 10000)}-${Math.floor(position[1] * 10000)}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
              maxZoom={18}
            />
            <Marker position={position}>
              <Popup>
                <div className="text-center">
                  <strong>🛰 Your Position</strong>
                  <br />
                  <small>
                    Lat: {position[0].toFixed(6)}<br />
                    Lng: {position[1].toFixed(6)}<br />
                    Last update: {new Date().toLocaleString()}
                  </small>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
      
      <LocationShare userLocation={position} />
    </div>
  );
};

export default MapView;