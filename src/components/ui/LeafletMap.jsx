import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Menu, Navigation, Plus, Minus, Locate, Layers } from 'lucide-react';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap = ({ userLocation, partners = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapType, setMapType] = useState('street');
  const tilesRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map with mobile-friendly options
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
      doubleClickZoom: true,
      touchZoom: true,
      scrollWheelZoom: true,
      dragging: true,
      tap: true,
      tapTolerance: 15,
      bounceAtZoomLimits: false
    });

    // Add default tiles
    tilesRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng])
      .addTo(mapInstanceRef.current)
      .bindPopup('Your Location');
    markersRef.current.push(userMarker);

    // Add partner markers
    partners.forEach(partner => {
      if (partner.location) {
        const partnerMarker = L.marker([partner.location.lat, partner.location.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(partner.name);
        markersRef.current.push(partnerMarker);
      }
    });

    // Update map center
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
  }, [userLocation, partners]);

  const switchMapType = (type) => {
    if (!mapInstanceRef.current || !tilesRef.current) return;
    
    mapInstanceRef.current.removeLayer(tilesRef.current);
    
    if (type === 'satellite') {
      tilesRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics'
      });
    } else {
      tilesRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });
    }
    
    tilesRef.current.addTo(mapInstanceRef.current);
    setMapType(type);
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const centerOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 17);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Zoom Controls - Right Side */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col space-y-1">
        <button
          onClick={zoomIn}
          className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={zoomOut}
          className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Minus className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* My Location Button - Bottom Right */}
      <div className="absolute bottom-32 right-4 z-[1000]">
        <button
          onClick={centerOnUser}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Locate className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Layer Toggle - Top Right */}
      <div className="absolute top-32 right-4 z-[1000]">
        <button
          onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
          className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                mapType === 'street' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {mapType === 'street' ? 'Street View' : 'Satellite View'}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {partners.length} Partners
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;