import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, Save } from 'lucide-react';
import Modal from './Modal';
import GradientButton from './GradientButton';

const NotificationsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    sosAlerts: true,
    locationSharing: true,
    emergencyContacts: true,
    appUpdates: false,
    soundEnabled: true,
    vibrationEnabled: true
  });

  useEffect(() => {
    if (settings) {
      setNotificationSettings({ ...settings });
    }
  }, [settings]);

  const handleToggle = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(notificationSettings);
    onClose();
  };

  const notificationOptions = [
    { key: 'sosAlerts', label: 'SOS Alerts', description: 'Get notified when SOS is triggered' },
    { key: 'locationSharing', label: 'Location Sharing', description: 'Alerts for location sharing requests' },
    { key: 'emergencyContacts', label: 'Emergency Contacts', description: 'Notifications from emergency contacts' },
    { key: 'appUpdates', label: 'App Updates', description: 'Receive update notifications' },
    { key: 'soundEnabled', label: 'Sound Notifications', description: 'Play sounds for alerts' },
    { key: 'vibrationEnabled', label: 'Vibration', description: 'Vibrate for notifications' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={onClose}>
          <motion.div
            className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Notification Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              {notificationOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{option.label}</h4>
                    <p className="text-sm text-white/60">{option.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(option.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings[option.key] ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <GradientButton
                onClick={handleSave}
                className="flex-1 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </GradientButton>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default NotificationsModal;