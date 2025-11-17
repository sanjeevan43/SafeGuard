import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Eye, EyeOff, Save, Lock, Unlock } from 'lucide-react';
import Modal from './Modal';
import GradientButton from './GradientButton';

const PrivacyModal = ({ isOpen, onClose, settings, onSave }) => {
  const [privacySettings, setPrivacySettings] = useState({
    locationVisible: true,
    profileVisible: false,
    emergencySharing: true,
    dataCollection: false,
    analytics: false,
    thirdPartySharing: false
  });

  useEffect(() => {
    if (settings) {
      setPrivacySettings({ ...settings });
    }
  }, [settings]);

  const handleToggle = (key) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(privacySettings);
    onClose();
  };

  const privacyOptions = [
    {
      key: 'locationVisible',
      label: 'Location Visibility',
      description: 'Allow others to see your location',
      icon: Eye,
      warning: false
    },
    {
      key: 'profileVisible',
      label: 'Profile Visibility',
      description: 'Make your profile visible to others',
      icon: Eye,
      warning: false
    },
    {
      key: 'emergencySharing',
      label: 'Emergency Sharing',
      description: 'Share location during emergencies',
      icon: Shield,
      warning: false
    },
    {
      key: 'dataCollection',
      label: 'Data Collection',
      description: 'Allow app to collect usage data',
      icon: EyeOff,
      warning: true
    },
    {
      key: 'analytics',
      label: 'Analytics',
      description: 'Share anonymous usage statistics',
      icon: EyeOff,
      warning: true
    },
    {
      key: 'thirdPartySharing',
      label: 'Third-party Sharing',
      description: 'Share data with partners',
      icon: Unlock,
      warning: true
    }
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
              <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-400">Privacy Notice</h4>
                  <p className="text-sm text-white/70 mt-1">
                    Your privacy is important. These settings control how your data is used and shared.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {privacyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${option.warning ? 'text-red-400' : 'text-green-400'}`} />
                      <div>
                        <h4 className="font-medium text-white">{option.label}</h4>
                        <p className="text-sm text-white/60">{option.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(option.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings[option.key] ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400">Security Tip</h4>
                  <p className="text-sm text-white/70 mt-1">
                    Keep emergency sharing enabled for your safety. Other settings can be adjusted based on your comfort level.
                  </p>
                </div>
              </div>
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

export default PrivacyModal;