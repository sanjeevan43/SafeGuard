import locationService from './locationService';
import { addHistoryEvent, getUser } from './firebaseService';

class EmergencyService {
  constructor() {
    this.isSOSActive = false;
    this.sosTimer = null;
    this.emergencyContacts = [];
  }

  // Trigger SOS emergency
  async triggerSOS(userId, countdown = 10) {
    if (this.isSOSActive) return;

    this.isSOSActive = true;
    
    try {
      // Get current location
      const position = await locationService.getCurrentPosition();
      const address = await locationService.getAddressFromCoords(position.lat, position.lng);
      
      // Get user data and emergency contacts
      const userData = await getUser(userId);
      this.emergencyContacts = userData?.emergencyContacts || [];

      // Start countdown
      return new Promise((resolve) => {
        let timeLeft = countdown;
        
        const countdownInterval = setInterval(() => {
          timeLeft--;
          
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            this.executeSOS(userId, position, address);
            resolve(true);
          }
        }, 1000);

        // Store timer for potential cancellation
        this.sosTimer = countdownInterval;
      });
      
    } catch (error) {
      console.error('SOS trigger error:', error);
      this.isSOSActive = false;
      throw error;
    }
  }

  // Execute SOS emergency
  async executeSOS(userId, position, address) {
    try {
      // Send notifications to emergency contacts
      await this.notifyEmergencyContacts(position, address);
      
      // Log emergency event
      await addHistoryEvent(userId, {
        type: 'emergency',
        title: 'SOS Alert Triggered',
        description: `Emergency alert sent from ${address}`,
        location: position,
        address: address,
        timestamp: new Date().toISOString(),
        status: 'active'
      });

      // Show browser notification
      this.showBrowserNotification('SOS Alert Sent', 'Emergency contacts have been notified');
      
      // Try to call emergency services (simulation)
      this.simulateEmergencyCall();
      
    } catch (error) {
      console.error('SOS execution error:', error);
    } finally {
      this.isSOSActive = false;
    }
  }

  // Cancel SOS
  cancelSOS(userId) {
    if (this.sosTimer) {
      clearInterval(this.sosTimer);
      this.sosTimer = null;
    }
    this.isSOSActive = false;
    
    // Log cancellation
    addHistoryEvent(userId, {
      type: 'safety',
      title: 'SOS Cancelled',
      description: 'Emergency alert was cancelled by user',
      timestamp: new Date().toISOString(),
      status: 'cancelled'
    });
  }

  // Notify emergency contacts
  async notifyEmergencyContacts(position, address) {
    const message = `🚨 EMERGENCY ALERT 🚨\n\nYour contact has triggered an SOS alert.\n\nLocation: ${address}\nCoordinates: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}\nTime: ${new Date().toLocaleString()}\n\nPlease check on them immediately!`;
    
    // Simulate SMS/Email notifications
    this.emergencyContacts.forEach(contact => {
      console.log(`📱 Sending emergency alert to ${contact.name} (${contact.phone})`);
      console.log(`Message: ${message}`);
      
      // In a real app, integrate with SMS/Email services
      this.simulateSMSNotification(contact, message);
    });
  }

  // Simulate SMS notification
  simulateSMSNotification(contact, message) {
    // In production, use services like Twilio, AWS SNS, etc.
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Emergency Alert Sent to ${contact.name}`, {
        body: `SMS sent to ${contact.phone}`,
        icon: '/favicon.ico'
      });
    }
  }

  // Show browser notification
  showBrowserNotification(title, body) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
          }
        });
      }
    }
  }

  // Simulate emergency call
  simulateEmergencyCall() {
    console.log('📞 Attempting to contact emergency services...');
    
    // In a real app, integrate with emergency services API
    setTimeout(() => {
      console.log('✅ Emergency services have been notified');
      this.showBrowserNotification('Emergency Services Contacted', 'Help is on the way');
    }, 2000);
  }

  // Send "I'm Safe" notification
  async sendSafeNotification(userId) {
    try {
      const position = await locationService.getCurrentPosition();
      const address = await locationService.getAddressFromCoords(position.lat, position.lng);
      
      const message = `✅ SAFETY UPDATE ✅\n\nYour contact has marked themselves as SAFE.\n\nLocation: ${address}\nTime: ${new Date().toLocaleString()}\n\nNo further action needed.`;
      
      // Notify emergency contacts
      this.emergencyContacts.forEach(contact => {
        console.log(`📱 Sending safety update to ${contact.name} (${contact.phone})`);
        this.simulateSMSNotification(contact, message);
      });

      // Log safety event
      await addHistoryEvent(userId, {
        type: 'safety',
        title: 'Marked as Safe',
        description: `User confirmed safety from ${address}`,
        location: position,
        address: address,
        timestamp: new Date().toISOString(),
        status: 'safe'
      });

      this.showBrowserNotification('Safety Confirmed', 'Emergency contacts have been notified');
      
    } catch (error) {
      console.error('Safe notification error:', error);
    }
  }

  // Check if SOS is active
  isActive() {
    return this.isSOSActive;
  }
}

export default new EmergencyService();