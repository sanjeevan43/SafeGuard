class NotificationService {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  // Show browser notification
  show(title, options = {}) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      return notification;
    }
  }

  // Show emergency notification
  showEmergency(title, body) {
    return this.show(title, {
      body,
      tag: 'emergency',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  // Show safety notification
  showSafety(title, body) {
    return this.show(title, {
      body,
      tag: 'safety',
      icon: '✅'
    });
  }

  // Show location sharing notification
  showLocationSharing(isSharing) {
    const title = isSharing ? 'Location Sharing Started' : 'Location Sharing Stopped';
    const body = isSharing ? 'Your location is now being shared with partners' : 'Location sharing has been disabled';
    
    return this.show(title, { body, tag: 'location' });
  }

  // Show partner connection notification
  showPartnerConnection(partnerName, isConnected) {
    const title = isConnected ? 'Partner Connected' : 'Partner Disconnected';
    const body = `${partnerName} is now ${isConnected ? 'online' : 'offline'}`;
    
    return this.show(title, { body, tag: 'partner' });
  }

  // Request permission if not granted
  async requestPermission() {
    if ('Notification' in window && this.permission !== 'granted') {
      this.permission = await Notification.requestPermission();
    }
    return this.permission;
  }

  // Check if notifications are supported and permitted
  isSupported() {
    return 'Notification' in window;
  }

  isPermitted() {
    return this.permission === 'granted';
  }
}

export default new NotificationService();