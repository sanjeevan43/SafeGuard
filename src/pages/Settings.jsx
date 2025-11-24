import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Bell, 
  Wifi, 
  Shield, 
  LogOut, 
  ChevronRight,
  Edit,
  Camera,
  Plus,
  Trash2,
  Copy,
  Share2,
  Map,
  Layers,
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../services/firebaseService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import NavbarBottom from '../components/navigation/NavbarBottom';
import SOSFloatingButton from '../components/ui/SOSFloatingButton';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import Modal from '../components/ui/Modal';
import { getProfilePhoto } from '../utils/profilePhoto';

const Settings = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'demo-user';
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    emergencyContacts: [],
    mapSettings: {
      defaultStyle: 'street',
      showPartners: true,
      showSafetyRadius: true,
      autoCenter: true,
      offlineMode: false
    },
    notificationSettings: {
      sosAlerts: true,
      locationSharing: true,
      emergencyContacts: true,
      appUpdates: false,
      soundEnabled: true,
      vibrationEnabled: true
    },
    privacySettings: {
      locationVisible: true,
      shareWithPartners: true,
      allowInvitations: true
    }
  });

  const [activeModal, setActiveModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const loadUserData = async () => {
    try {
      const user = await getUser(userId);
      if (user) {
        if (!user.inviteCode) {
          const newCode = generateInviteCode();
          await updateUser(userId, { inviteCode: newCode });
          user.inviteCode = newCode;
        }
        // Set profile photo from email if not already set
        if (!user.avatar && user.email) {
          user.avatar = getProfilePhoto(user.email);
        }
        setUserData(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async (data) => {
    setLoading(true);
    try {
      const success = await updateUser(userId, data);
      if (success) {
        setUserData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
    setLoading(false);
  };

  const handleSOSClick = () => {
    navigate('/sos');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const openModal = (modalType) => {
    setActiveModal(modalType);
    setEditData(userData);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditData({});
    setNewContact({ name: '', phone: '', relation: '' });
  };

  const handleSave = async () => {
    await saveUserData(editData);
    closeModal();
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingToggle = (category, field) => {
    setEditData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category]?.[field]
      }
    }));
  };

  const handleMapStyleChange = (style) => {
    setEditData(prev => ({
      ...prev,
      mapSettings: {
        ...prev.mapSettings,
        defaultStyle: style
      }
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const newUserData = { avatar: e.target.result };
        await saveUserData(newUserData);
      };
      reader.readAsDataURL(file);
    }
  };

  const addEmergencyContact = async () => {
    if (newContact.name && newContact.phone && newContact.relation) {
      const updatedContacts = [...(userData.emergencyContacts || []), { ...newContact, id: Date.now() }];
      await saveUserData({ emergencyContacts: updatedContacts });
      setNewContact({ name: '', phone: '', relation: '' });
    }
  };

  const deleteEmergencyContact = async (contactId) => {
    const updatedContacts = userData.emergencyContacts.filter(contact => contact.id !== contactId);
    await saveUserData({ emergencyContacts: updatedContacts });
  };

  const copyInviteCode = () => {
    if (userData.inviteCode) {
      navigator.clipboard.writeText(userData.inviteCode);
      alert('Invite code copied to clipboard!');
    }
  };

  const shareInviteCode = () => {
    if (userData.inviteCode && navigator.share) {
      navigator.share({
        title: 'SafeGuard Invite Code',
        text: `Join me on SafeGuard! Use my invite code: ${userData.inviteCode}`,
      });
    } else {
      copyInviteCode();
    }
  };

  const settingsItems = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your personal information',
      action: () => openModal('profile')
    },
    {
      icon: Phone,
      title: 'Emergency Contacts',
      description: 'Add and manage emergency contacts',
      action: () => openModal('contacts')
    },
    {
      icon: Map,
      title: 'Map Settings',
      description: 'Configure map display and behavior',
      action: () => openModal('map')
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure alert preferences',
      action: () => openModal('notifications')
    },
    {
      icon: Wifi,
      title: 'Offline Mode',
      description: 'Settings for offline functionality',
      action: () => openModal('offline')
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Control your privacy settings',
      action: () => openModal('privacy')
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your SafeGuard preferences</p>
        </motion.div>
      </div>

      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-20 blur-xl" />
            
            <CardContent className="relative flex items-center space-x-4 p-4">
              <div className="relative">
                <img
                  src={userData.avatar || getProfilePhoto(userData.email)}
                  alt={userData.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-400/50"
                />
                <label className="absolute -bottom-1 -right-1 p-2 bg-purple-600 rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{userData.name || 'Add Name'}</h3>
                <p className="text-white/60">{userData.email || 'Add Email'}</p>
                <p className="text-white/40 text-sm">{userData.phone || 'Add Phone'}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openModal('profile')}
                className="hover:bg-white/10 text-white/60 hover:text-white"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {userData.inviteCode && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-white mb-2">Your Invite Code</h3>
                <p className="text-white/60 text-sm mb-4">Share this code with friends to connect</p>
                <div className="bg-purple-600/20 rounded-xl p-4 mb-4">
                  <code className="text-3xl font-mono text-purple-300 tracking-wider">
                    {userData.inviteCode}
                  </code>
                </div>
                <div className="flex space-x-3">
                  <GradientButton
                    variant="secondary"
                    onClick={copyInviteCode}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </GradientButton>
                  <GradientButton
                    onClick={shareInviteCode}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <div className="px-6 space-y-4">
        {settingsItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <GlassCard
                hover
                onClick={item.action}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="px-6 mt-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GradientButton
            variant="danger"
            onClick={handleLogout}
            className="w-full flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </GradientButton>
        </motion.div>
      </div>

      <Modal
        isOpen={activeModal === 'profile'}
        onClose={closeModal}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="floating-input"
            value={editData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="floating-input"
            value={editData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone"
            className="floating-input"
            value={editData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          <div className="flex space-x-3 mt-6">
            <GradientButton variant="secondary" onClick={closeModal} className="flex-1">
              Cancel
            </GradientButton>
            <GradientButton onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </GradientButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'contacts'}
        onClose={closeModal}
        title="Emergency Contacts"
      >
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h4 className="font-medium text-white mb-3">Add New Contact</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                className="floating-input"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="floating-input"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Relation (e.g., Father, Mother)"
                className="floating-input"
                value={newContact.relation}
                onChange={(e) => setNewContact(prev => ({ ...prev, relation: e.target.value }))}
              />
              <GradientButton onClick={addEmergencyContact} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </GradientButton>
            </div>
          </div>

          {userData.emergencyContacts?.length > 0 ? (
            userData.emergencyContacts.map((contact, index) => (
              <div key={contact.id || index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">{contact.name}</h4>
                  <p className="text-white/60">{contact.relation}</p>
                  <p className="text-white/80">{contact.phone}</p>
                </div>
                <motion.button
                  onClick={() => deleteEmergencyContact(contact.id || index)}
                  className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">No emergency contacts added yet</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Map Settings Modal */}
      <Modal
        isOpen={activeModal === 'map'}
        onClose={closeModal}
        title="Map Settings"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Default Map Style
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'street', name: 'Street Map', desc: 'Standard road map with labels', icon: '🗺️' },
                { key: 'satellite', name: 'Satellite View', desc: 'High-resolution satellite imagery', icon: '🛰️' },
                { key: 'dark', name: 'Dark Mode', desc: 'Dark theme for night use', icon: '🌙' }
              ].map(({ key, name, desc, icon }) => (
                <button
                  key={key}
                  onClick={() => handleMapStyleChange(key)}
                  className={`flex items-center p-3 rounded-lg text-left transition-colors ${
                    editData.mapSettings?.defaultStyle === key
                      ? 'bg-purple-600 text-white border-2 border-purple-400'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl mr-3">{icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{name}</div>
                    <div className="text-xs opacity-80">{desc}</div>
                  </div>
                  {editData.mapSettings?.defaultStyle === key && (
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Map Preview */}
          <div>
            <h4 className="font-medium text-white mb-3">Preview</h4>
            <div className="h-32 bg-white/5 rounded-lg border border-white/20 flex items-center justify-center">
              <div className="text-center text-white/60">
                <Map className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Map preview with {editData.mapSettings?.defaultStyle || 'street'} style</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white flex items-center">
              <Navigation className="w-4 h-4 mr-2" />
              Display Options
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-white">Show Partners</span>
                <p className="text-xs text-white/60">Display partner locations on map</p>
              </div>
              <button
                onClick={() => handleSettingToggle('mapSettings', 'showPartners')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.mapSettings?.showPartners ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.mapSettings?.showPartners ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-white">Safety Radius</span>
                <p className="text-xs text-white/60">Show safety circle around your location</p>
              </div>
              <button
                onClick={() => handleSettingToggle('mapSettings', 'showSafetyRadius')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.mapSettings?.showSafetyRadius ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.mapSettings?.showSafetyRadius ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-white">Auto Center</span>
                <p className="text-xs text-white/60">Automatically center map on your location</p>
              </div>
              <button
                onClick={() => handleSettingToggle('mapSettings', 'autoCenter')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.mapSettings?.autoCenter ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.mapSettings?.autoCenter ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Map Controls Help */}
          <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3">
            <h5 className="font-medium text-blue-400 mb-2 flex items-center">
              <Navigation className="w-4 h-4 mr-2" />
              Map Controls Guide
            </h5>
            <div className="text-xs text-blue-300 space-y-1">
              <div className="flex justify-between">
                <span>🎯 Center on location:</span>
                <span>Purple button</span>
              </div>
              <div className="flex justify-between">
                <span>👥 View all partners:</span>
                <span>Blue button</span>
              </div>
              <div className="flex justify-between">
                <span>🗺️ Change map style:</span>
                <span>Gray button (hover)</span>
              </div>
              <div className="flex justify-between">
                <span>⚙️ Quick toggles:</span>
                <span>Top-left corner</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <GradientButton variant="secondary" onClick={closeModal} className="flex-1">
              Cancel
            </GradientButton>
            <GradientButton onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </GradientButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'notifications'}
        onClose={closeModal}
        title="Notification Settings"
      >
        <div className="space-y-4">
          {Object.entries({
            sosAlerts: { label: 'SOS Alerts', desc: 'Get notified when SOS is triggered' },
            locationSharing: { label: 'Location Sharing', desc: 'Alerts for location sharing requests' },
            emergencyContacts: { label: 'Emergency Contacts', desc: 'Notifications from emergency contacts' },
            appUpdates: { label: 'App Updates', desc: 'Receive update notifications' },
            soundEnabled: { label: 'Sound Notifications', desc: 'Play sounds for alerts' },
            vibrationEnabled: { label: 'Vibration', desc: 'Vibrate for notifications' }
          }).map(([key, { label, desc }]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-white">{label}</span>
                <p className="text-xs text-white/60">{desc}</p>
              </div>
              <button
                onClick={() => handleSettingToggle('notificationSettings', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.notificationSettings?.[key] ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.notificationSettings?.[key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
          <div className="flex space-x-3 mt-6">
            <GradientButton variant="secondary" onClick={closeModal} className="flex-1">
              Cancel
            </GradientButton>
            <GradientButton onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </GradientButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'offline'}
        onClose={closeModal}
        title="Offline Mode"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <span className="text-white">Enable Offline Mode</span>
              <p className="text-xs text-white/60">Cache maps and data for offline use</p>
            </div>
            <button
              onClick={() => handleSettingToggle('mapSettings', 'offlineMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editData.mapSettings?.offlineMode ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editData.mapSettings?.offlineMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 Offline mode will download map tiles and cache essential data for use without internet connection.
            </p>
          </div>
          <div className="flex space-x-3 mt-6">
            <GradientButton variant="secondary" onClick={closeModal} className="flex-1">
              Cancel
            </GradientButton>
            <GradientButton onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </GradientButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={closeModal}
        title="Privacy & Security"
      >
        <div className="space-y-4">
          {Object.entries({
            locationVisible: { label: 'Location Visible to Partners', desc: 'Allow partners to see your location' },
            shareWithPartners: { label: 'Share Location Data', desc: 'Share location history with connected partners' },
            allowInvitations: { label: 'Allow Partner Invitations', desc: 'Receive partner connection requests' }
          }).map(([key, { label, desc }]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-white">{label}</span>
                <p className="text-xs text-white/60">{desc}</p>
              </div>
              <button
                onClick={() => handleSettingToggle('privacySettings', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.privacySettings?.[key] ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editData.privacySettings?.[key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
          <div className="flex space-x-3 mt-6">
            <GradientButton variant="secondary" onClick={closeModal} className="flex-1">
              Cancel
            </GradientButton>
            <GradientButton onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </GradientButton>
          </div>
        </div>
      </Modal>

      <SOSFloatingButton onClick={handleSOSClick} />
      <NavbarBottom />
    </div>
  );
};

export default Settings;