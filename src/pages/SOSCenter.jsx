import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MessageSquare, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/ui/GradientButton';
import GlassCard from '../components/ui/GlassCard';
import emergencyService from '../services/emergencyService';
import { getUser } from '../services/firebaseService';

const SOSCenter = () => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    loadEmergencyContacts();
    setIsSOSActive(emergencyService.isActive());
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const userData = await getUser(userId);
      setEmergencyContacts(userData?.emergencyContacts || []);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const handleSOSPress = async () => {
    if (isSOSActive || loading) return;
    
    setLoading(true);
    setCountdown(10);
    
    try {
      // Start real emergency service
      await emergencyService.triggerSOS(userId, 10);
      setIsSOSActive(true);
      setCountdown(null);
    } catch (error) {
      console.error('SOS trigger failed:', error);
      alert('Failed to trigger SOS. Please try again or call emergency services directly.');
      setCountdown(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    emergencyService.cancelSOS(userId);
    setCountdown(null);
    setIsSOSActive(false);
  };

  const handleImSafe = async () => {
    try {
      await emergencyService.sendSafeNotification(userId);
      setIsSOSActive(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to send safe notification:', error);
    }
  };

  const callEmergencyServices = () => {
    // In a real app, this would initiate a call
    window.open('tel:911');
  };

  const callEmergencyContact = (phone) => {
    window.open(`tel:${phone}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Emergency Center</h1>
          <p className="text-red-200">Press and hold for emergency assistance</p>
        </motion.div>
      </div>

      {/* Main SOS Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {!isSOSActive ? (
            <motion.div
              key="sos-button"
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {countdown ? (
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <motion.div
                    className="w-64 h-64 bg-red-600 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
                    animate={{ 
                      boxShadow: [
                        '0 0 40px rgba(239, 68, 68, 0.8)',
                        '0 0 80px rgba(239, 68, 68, 1)',
                        '0 0 40px rgba(239, 68, 68, 0.8)'
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-red-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                    <div className="relative z-10 text-center">
                      <AlertTriangle className="w-16 h-16 text-white mb-4 mx-auto" />
                      <div className="text-6xl font-bold text-white">{countdown}</div>
                      <p className="text-white/80 mt-2">Sending Alert...</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GradientButton
                      variant="secondary"
                      onClick={handleCancel}
                      className="bg-white/20 hover:bg-white/30"
                    >
                      Cancel
                    </GradientButton>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.button
                    className="w-64 h-64 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(239, 68, 68, 0.5)',
                        '0 0 40px rgba(239, 68, 68, 0.8)',
                        '0 0 20px rgba(239, 68, 68, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    onMouseDown={handleSOSPress}
                    onTouchStart={handleSOSPress}
                  >
                    <div className="text-center">
                      <AlertTriangle className="w-20 h-20 text-white mb-4 mx-auto" />
                      <div className="text-2xl font-bold text-white">SOS</div>
                      <p className="text-white/80 text-sm mt-2">Hold to activate</p>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sos-active"
              className="text-center w-full max-w-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 40px rgba(239, 68, 68, 0.8)',
                    '0 0 80px rgba(239, 68, 68, 1)',
                    '0 0 40px rgba(239, 68, 68, 0.8)'
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-16 h-16 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Emergency Alert Active</h2>
              <p className="text-red-200 mb-8">Your emergency contacts have been notified</p>
              
              <div className="space-y-4">
                <GradientButton
                  onClick={handleImSafe}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I'm Safe Now
                </GradientButton>
                
                <div className="grid grid-cols-2 gap-4">
                  <GradientButton 
                    variant="secondary" 
                    className="bg-white/20"
                    onClick={callEmergencyServices}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call 911
                  </GradientButton>
                  <GradientButton variant="secondary" className="bg-white/20">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Send Message
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emergency Contacts */}
      {!isSOSActive && !countdown && (
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="bg-red-900/30">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Emergency Contacts
            </h3>
            <div className="space-y-3">
              {emergencyContacts.length > 0 ? (
                emergencyContacts.map((contact, index) => (
                  <div key={contact.id || index} className="flex items-center justify-between">
                    <span className="text-white">{contact.name} ({contact.relation})</span>
                    <button 
                      className="text-red-300 hover:text-white"
                      onClick={() => callEmergencyContact(contact.phone)}
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/60">No emergency contacts added</p>
                  <button 
                    className="text-red-300 hover:text-white text-sm mt-2"
                    onClick={() => navigate('/settings')}
                  >
                    Add contacts in Settings
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default SOSCenter;