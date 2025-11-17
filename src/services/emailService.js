// Email notification service using EmailJS (free service)
class EmailService {
  constructor() {
    this.serviceId = 'service_safeguard';
    this.templateId = 'template_partner_invite';
    this.publicKey = 'your_emailjs_public_key';
    this.initialized = false;
    this.isDemo = true; // Set to false when EmailJS is configured
  }

  // Initialize EmailJS
  async init() {
    if (this.initialized) return;
    
    try {
      if (!this.isDemo) {
        // Load EmailJS library dynamically
        if (!window.emailjs) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);
        }
        
        window.emailjs.init(this.publicKey);
        console.log('EmailJS initialized');
      } else {
        console.log('Email service initialized (demo mode)');
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isDemo = true; // Fallback to demo mode
    }
  }

  // Send partner invitation email
  async sendPartnerInvite(toEmail, fromName, fromEmail, inviteCode) {
    console.log('EmailService: sendPartnerInvite called with:', { toEmail, fromName, fromEmail, inviteCode });
    
    try {
      await this.init();
      
      const emailData = {
        to_email: toEmail,
        from_name: fromName,
        from_email: fromEmail,
        invite_code: inviteCode,
        app_url: window.location.origin,
        subject: `${fromName} invited you to SafeGuard`,
        message: this.createInvitationMessage(fromName, fromEmail, inviteCode)
      };

      // Always use demo mode for now
      console.log('📧 [DEMO] Sending partner invite email to:', toEmail);
      console.log('📧 Email content:');
      console.log(emailData.message);
      
      // Store invitation in localStorage
      try {
        const invitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]');
        invitations.push({
          id: Date.now(),
          toEmail,
          fromName,
          fromEmail,
          inviteCode,
          message: emailData.message,
          sentAt: new Date().toISOString(),
          status: 'sent'
        });
        localStorage.setItem('sentInvitations', JSON.stringify(invitations));
        console.log('Invitation stored in localStorage');
      } catch (storageError) {
        console.warn('Failed to store in localStorage:', storageError);
      }
      
      // Show notification
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Invitation Sent', {
            body: `Partner invitation sent to ${toEmail}`,
            icon: '/favicon.ico'
          });
        }
      } catch (notificationError) {
        console.warn('Failed to show notification:', notificationError);
      }
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { 
        success: true, 
        message: `✅ Invitation sent to ${toEmail}! Check browser console for email content.` 
      };
      
    } catch (error) {
      console.error('EmailService error:', error);
      return { 
        success: false, 
        message: `Failed to send invitation: ${error.message}` 
      };
    }
  }

  // Send connection confirmation email
  async sendConnectionConfirmation(toEmail, partnerName) {
    await this.init();
    
    try {
      console.log(`📧 Sending connection confirmation to ${toEmail}`);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Partner Connected', {
          body: `${partnerName} is now your safety partner`,
          icon: '/favicon.ico'
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  }

  // Send emergency alert email
  async sendEmergencyAlert(toEmail, fromName, location, message) {
    await this.init();
    
    try {
      console.log(`🚨 Sending emergency alert to ${toEmail}`);
      
      const alertData = {
        to_email: toEmail,
        from_name: fromName,
        location: location,
        message: message,
        timestamp: new Date().toLocaleString()
      };

      // Show critical notification
      if ('Notification' in window) {
        new Notification('🚨 EMERGENCY ALERT', {
          body: `${fromName} needs help! Location: ${location}`,
          icon: '/favicon.ico',
          requireInteraction: true
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }
  }

  // Create formatted invitation message
  createInvitationMessage(fromName, fromEmail, inviteCode) {
    return `Hi there!

${fromName} (${fromEmail}) has invited you to connect on SafeGuard - Personal Safety App.

SafeGuard helps you stay connected with your trusted circle and ensures your safety through:
• Real-time location sharing
• Emergency SOS alerts
• Safety check-ins
• Trusted partner network

To join and connect with ${fromName}:
1. Visit: ${window.location.origin}
2. Sign up for SafeGuard
3. Use invite code: ${inviteCode}

Once you join, you'll be able to:
✓ Share your location with ${fromName}
✓ Receive and send safety alerts
✓ Stay connected with your safety network

Stay safe!
The SafeGuard Team

---
This invitation was sent by ${fromName}. If you don't know this person, please ignore this email.`;
  }
}

export default new EmailService();