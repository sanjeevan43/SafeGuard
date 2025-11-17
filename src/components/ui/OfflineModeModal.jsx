import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, WifiOff, Save, MapPin, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import GradientButton from './GradientButton';

const OfflineModeModal = ({ isOpen, onClose, settings, onSave }) => {
  const [offlineSettings, setOfflineSettings] = useState({
    enabled: false,
    cacheLocation: true,
    emergencyMode: true,
    autoSync: false,
    cacheRadius: 5 // km
  });

  useEffect(() => {
    if (settings) {
      setOfflineSettings({ ...settings });
    }
  }, [settings]);

  const handleToggle = (key) => {
    setOfflineSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSliderChange = (value) => {
    setOfflineSettings(prev => ({ ...prev, cacheRadius: value }));
  };

  const handleSave = () => {
    onSave(offlineSettings);
    onClose();
  };

  const offlineOptions = [
    {
      key: 'cacheLocation',
      label: 'Cache Location Data',
      description: 'Store location history offline',
      icon: MapPin
    },
    {
      key: 'emergencyMode',
      label: 'Emergency Mode',
      description: 'Limited functionality when offline',
      icon: AlertTriangle
    },
    {
      key: 'autoSync',
      label: 'Auto Sync',
      description: 'Sync data when connection returns',
      icon: Wifi
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
              <h2 className="text-xl font-bold text-white">Offline Mode Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg mb-6">
              <div className="flex items-center space-x-3">
                {offlineSettings.enabled ? (
                  <WifiOff className="w-6 h-6 text-red-400" />
                ) : (
                  <Wifi className="w-6 h-6 text-green-400" />
                )}
                <div>
                  <h4 className="font-medium text-white">Offline Mode</h4>
                  <p className="text-sm text-white/60">
                    {offlineSettings.enabled ? 'Currently offline' : 'Online mode active'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  offlineSettings.enabled ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    offlineSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Cache Radius Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Cache Radius: {offlineSettings.cacheRadius} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={offlineSettings.cacheRadius}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {offlineOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="font-medium text-white">{option.label}</h4>
                        <p className="text-sm text-white/60">{option.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(option.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        offlineSettings[option.key] ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          offlineSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
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

export default OfflineModeModal;