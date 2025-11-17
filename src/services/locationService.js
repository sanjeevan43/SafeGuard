// Real geolocation service
class LocationService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.callbacks = new Set();
    this.sharingEnabled = false;
    this.sharingPartners = [];
    this.userDetails = null;
  }

  // Get current position
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(this.currentPosition);
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Start watching position
  startWatching(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    this.callbacks.add(callback);

    if (!this.watchId) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0,
            timestamp: Date.now()
          };
          
          this.callbacks.forEach(cb => cb(this.currentPosition));
        },
        (error) => {
          console.error('Location error:', error);
          this.callbacks.forEach(cb => cb(null, error));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    }

    return () => this.stopWatching(callback);
  }

  // Stop watching position
  stopWatching(callback) {
    if (callback) {
      this.callbacks.delete(callback);
    }

    if (this.callbacks.size === 0 && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get address from coordinates
  async getAddressFromCoords(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || 'Unknown location';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Unknown location';
    }
  }

  // Set user details for sharing
  setUserDetails(userDetails) {
    this.userDetails = userDetails;
  }

  // Enable location sharing with partners
  enableSharing(partners = []) {
    this.sharingEnabled = true;
    this.sharingPartners = partners;
    console.log('Location sharing enabled with partners:', partners.map(p => p.name));
  }

  // Disable location sharing
  disableSharing() {
    this.sharingEnabled = false;
    this.sharingPartners = [];
    console.log('Location sharing disabled');
  }

  // Get sharing status
  getSharingStatus() {
    return {
      enabled: this.sharingEnabled,
      partnersCount: this.sharingPartners.length,
      partners: this.sharingPartners,
      userDetails: this.userDetails
    };
  }

  // Share current location with partners
  async shareLocationWithPartners() {
    if (!this.sharingEnabled || !this.currentPosition || !this.userDetails) {
      return false;
    }

    const locationData = {
      ...this.currentPosition,
      user: {
        id: this.userDetails.id,
        name: this.userDetails.name,
        email: this.userDetails.email,
        avatar: this.userDetails.avatar
      },
      address: await this.getAddressFromCoords(this.currentPosition.lat, this.currentPosition.lng),
      sharedAt: new Date().toISOString()
    };

    console.log('Sharing location with partners:', locationData);
    
    // Store in localStorage for demo
    const sharedLocations = JSON.parse(localStorage.getItem('sharedLocations') || '[]');
    sharedLocations.push(locationData);
    localStorage.setItem('sharedLocations', JSON.stringify(sharedLocations));

    return locationData;
  }
}

export default new LocationService();