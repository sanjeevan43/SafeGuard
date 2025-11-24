import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MapPin, MessageCircle, Shield, UserPlus, Trash2, Send, Link, Users, Share2, Copy, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import GlassCard from '../components/ui/GlassCard';
import PartnerCard from '../components/ui/PartnerCard';
import NavbarBottom from '../components/navigation/NavbarBottom';
import SOSFloatingButton from '../components/ui/SOSFloatingButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import MessagingModal from '../components/ui/MessagingModal';
import PartnerMiniMap from '../components/ui/PartnerMiniMap';
import { getUser, addPartner, getPartners, updatePartner, deletePartner, findUserByInviteCode, findUserByEmail, sendPartnerInvitation, addHistoryEvent } from '../services/firebaseService';
import locationService from '../services/locationService';
import notificationService from '../services/notificationService';
import emailService from '../services/emailService';
import { demoPartners, addDemoPartners } from '../data/demoPartners';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [connectCode, setConnectCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [userData, setUserData] = useState({});
  const [connectionStats, setConnectionStats] = useState({
    connected: 0,
    pending: 0,
    sharing: 0
  });
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingPartner, setMessagingPartner] = useState(null);
  const [expandedMaps, setExpandedMaps] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    loadUserData();
    loadPartners();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const position = await locationService.getCurrentPosition();
      setUserLocation(position);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (partnerLocation) => {
    if (!userLocation || !partnerLocation) return null;
    return locationService.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      partnerLocation.lat,
      partnerLocation.lng
    );
  };

  const loadUserData = async () => {
    try {
      const user = await getUser(userId);
      if (user) {
        // Ensure user has an invite code
        if (!user.inviteCode) {
          const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          user.inviteCode = newCode;
          // Update user with invite code
          await updateUser(userId, { inviteCode: newCode });
        }
        setUserData(user);
        console.log('User data loaded:', user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPartners = async () => {
    try {
      let partnersData = await getPartners(userId);
      
      // Add demo partners if no partners exist
      if (!partnersData || partnersData.length === 0) {
        console.log('No partners found, adding demo partners...');
        await addDemoPartners(userId, addPartner);
        partnersData = await getPartners(userId) || demoPartners;
      }
      
      setPartners(partnersData);
      updateConnectionStats(partnersData);
    } catch (error) {
      console.error('Error loading partners:', error);
      // Fallback to demo partners if Firebase fails
      setPartners(demoPartners);
      updateConnectionStats(demoPartners);
    }
  };

  const updateConnectionStats = (partnersData = partners) => {
    const connected = partnersData.filter(p => p.connectionStatus === 'connected').length;
    const pending = partnersData.filter(p => p.connectionStatus === 'pending').length;
    const sharing = partnersData.filter(p => p.status === 'sharing').length;
    
    setConnectionStats({ connected, pending, sharing });
  };

  const connectWithCode = async () => {
    if (connectCode.length === 6) {
      setLoading(true);
      try {
        // Find user by invite code
        const foundUser = await findUserByInviteCode(connectCode);
        
        if (foundUser) {
          // Get current location for both users
          let currentLocation = null;
          try {
            currentLocation = await locationService.getCurrentPosition();
          } catch (error) {
            console.warn('Could not get current location:', error);
          }

          // Add as partner
          const partnerData = {
            userId: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            avatar: foundUser.avatar,
            status: 'online',
            isSharing: false,
            lastSeen: 'Active now',
            safetyScore: 95,
            location: currentLocation ? {
              lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
              lng: currentLocation.lng + (Math.random() - 0.5) * 0.01
            } : {
              lat: 40.7128 + (Math.random() - 0.5) * 0.05,
              lng: -74.0060 + (Math.random() - 0.5) * 0.05
            },
            connectionStatus: 'connected',
            mutualConnection: true,
            connectedAt: new Date().toISOString()
          };
          
          await addPartner(userId, partnerData);
          
          // Also add current user as partner to the found user
          const currentUserPartnerData = {
            userId: userId,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
            status: 'online',
            isSharing: false,
            lastSeen: 'Active now',
            safetyScore: 90,
            location: currentLocation || {
              lat: 40.7128 + (Math.random() - 0.5) * 0.05,
              lng: -74.0060 + (Math.random() - 0.5) * 0.05
            },
            connectionStatus: 'connected',
            mutualConnection: true,
            connectedAt: new Date().toISOString()
          };
          
          await addPartner(foundUser.id, currentUserPartnerData);
          
          // Log connection event
          await addHistoryEvent(userId, {
            type: 'partner',
            title: 'New Partner Connected',
            description: `Successfully connected with ${foundUser.name}`,
            timestamp: new Date().toISOString(),
            status: 'connected'
          });

          // Show notification
          notificationService.showPartnerConnection(foundUser.name, true);
          
          setConnectCode('');
          setShowConnectModal(false);
          loadPartners();
          alert(`Successfully connected with ${foundUser.name}!`);
        } else {
          alert('Invalid invite code. Please check and try again.');
        }
      } catch (error) {
        console.error('Error connecting with code:', error);
        alert('Error connecting. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    try {
      await deletePartner(userId, partnerId);
      loadPartners();
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  };

  const updatePartnerStatus = async (partnerId, status) => {
    try {
      const updatedData = { 
        status, 
        isSharing: status === 'sharing', 
        lastSeen: status === 'online' ? 'Active now' : 'Recently'
      };
      await updatePartner(userId, partnerId, updatedData);
      loadPartners();
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  };

  const copyInviteCode = () => {
    if (userData.inviteCode) {
      navigator.clipboard.writeText(userData.inviteCode);
      alert('Invite code copied to clipboard!');
    }
  };

  const sendEmailInvitation = async () => {
    console.log('Starting email invitation process...');
    console.log('Invite email:', inviteEmail);
    console.log('User data:', userData);
    
    if (!inviteEmail) {
      alert('Please enter an email address');
      return;
    }
    
    if (!userData.name) {
      alert('Please update your profile name first');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Checking if user exists...');
      const existingUser = await findUserByEmail(inviteEmail);
      console.log('Existing user found:', existingUser);
      
      if (existingUser) {
        console.log('User exists, connecting directly...');
        const currentLocation = await locationService.getCurrentPosition().catch(() => null);
        
        const partnerData = {
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          avatar: existingUser.avatar,
          status: 'online',
          isSharing: false,
          lastSeen: 'Active now',
          safetyScore: 95,
          location: currentLocation ? {
            lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: currentLocation.lng + (Math.random() - 0.5) * 0.01
          } : {
            lat: 40.7128 + (Math.random() - 0.5) * 0.05,
            lng: -74.0060 + (Math.random() - 0.5) * 0.05
          },
          connectionStatus: 'connected',
          connectedAt: new Date().toISOString()
        };
        
        await addPartner(userId, partnerData);
        
        const currentUserPartnerData = {
          userId: userId,
          name: userData.name,
          email: userData.email || 'demo@safeguard.app',
          avatar: userData.avatar,
          status: 'online',
          isSharing: false,
          lastSeen: 'Active now',
          safetyScore: 90,
          location: currentLocation || {
            lat: 40.7128 + (Math.random() - 0.5) * 0.05,
            lng: -74.0060 + (Math.random() - 0.5) * 0.05
          },
          connectionStatus: 'connected',
          connectedAt: new Date().toISOString()
        };
        
        await addPartner(existingUser.id, currentUserPartnerData);
        await emailService.sendConnectionConfirmation(inviteEmail, userData.name);
        
        alert(`✅ Successfully connected with ${existingUser.name}!`);
      } else {
        console.log('User does not exist, sending invitation...');
        
        // Store invitation in Firebase
        const invitationResult = await sendPartnerInvitation(userId, inviteEmail, inviteMessage);
        console.log('Invitation stored:', invitationResult);
        
        // Send email
        const emailResult = await emailService.sendPartnerInvite(
          inviteEmail, 
          userData.name || 'SafeGuard User', 
          userData.email || 'demo@safeguard.app', 
          userData.inviteCode || 'DEMO123'
        );
        
        console.log('Email send result:', emailResult);
        
        if (emailResult && emailResult.success) {
          alert(emailResult.message);
        } else if (emailResult && !emailResult.success) {
          alert(emailResult.message);
          setLoading(false);
          return;
        } else {
          alert('✅ Invitation sent successfully! Check console for email content.');
        }
      }
      
      // Log event
      try {
        await addHistoryEvent(userId, {
          type: 'partner',
          title: 'Partner Invitation Sent',
          description: `Sent invitation to ${inviteEmail}`,
          timestamp: new Date().toISOString(),
          status: 'sent'
        });
      } catch (historyError) {
        console.warn('Failed to log history event:', historyError);
      }
      
      setInviteEmail('');
      setInviteMessage('');
      setShowEmailModal(false);
      loadPartners();
      
    } catch (error) {
      console.error('Error in sendEmailInvitation:', error);
      alert(`Error: ${error.message || 'Failed to send invitation'}`);
    }
    setLoading(false);
  };

  const filteredPartners = partners.filter(partner =>
    partner.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
  };

  const handleSOSClick = () => {
    navigate('/sos');
  };

  const openMessaging = (partner) => {
    setMessagingPartner(partner);
    setShowMessaging(true);
  };

  const closeMessaging = () => {
    setShowMessaging(false);
    setMessagingPartner(null);
  };

  const toggleMapExpansion = (partnerId) => {
    setExpandedMaps(prev => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Safety Partners</h1>
              <p className="text-white/60">Stay connected with your trusted circle</p>
            </div>
          </div>

          {/* Connect with Partner Buttons */}
          <div className="mb-6 space-y-3">
            <Button
              onClick={() => setShowEmailModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite by Email
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConnectModal(true)}
              className="w-full border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              <Link className="w-5 h-5 mr-2" />
              Connect with Code
            </Button>
          </div>

          {/* Your Invite Code */}
          {userData.inviteCode && (
            <GlassCard className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white mb-1">Your Invite Code</h3>
                  <p className="text-white/60 text-sm">Share this code with friends to connect</p>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-lg font-mono text-xl">
                    {userData.inviteCode}
                  </code>
                  <motion.button
                    onClick={copyInviteCode}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Copy className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Connection Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-3">
                <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{connectionStats.connected}</p>
                <p className="text-xs text-white/60">Connected</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-3">
                <Share2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{connectionStats.sharing}</p>
                <p className="text-xs text-white/60">Sharing</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-3">
                <Send className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{connectionStats.pending}</p>
                <p className="text-xs text-white/60">Pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search partners..."
              className="floating-input pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
      </div>

      {/* Partners List */}
      <div className="px-6 space-y-4">
        {filteredPartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            <PartnerCard
              partner={partner}
              onClick={() => handlePartnerClick(partner)}
              onMessage={openMessaging}
              userLocation={userLocation}
              calculateDistance={calculateDistance}
            />
            
            {/* Individual Partner Map */}
            {partner.location && partner.connectionStatus === 'connected' && (
              <PartnerMiniMap
                partner={partner}
                isExpanded={expandedMaps[partner.id]}
                onToggleExpand={() => toggleMapExpansion(partner.id)}
              />
            )}
          </motion.div>
        ))}

        {filteredPartners.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <UserPlus className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No partners found</h3>
            <p className="text-white/60 mb-6">Connect with friends using invite codes</p>
            <Button 
              onClick={() => setShowConnectModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Connect with Code
            </Button>
          </motion.div>
        )}
      </div>

      {/* Email Invitation Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Invite Partner by Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-white/80 mb-4">Send a SafeGuard invitation to your friend or family member</p>
              <Input
                type="email"
                placeholder="Enter email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <textarea
                placeholder="Add a personal message (optional)"
                className="w-full min-h-[80px] resize-none bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(false)}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={sendEmailInvitation}
              disabled={!inviteEmail || loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect with Code Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Connect with Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white/80 mb-4">Enter your partner's invite code to connect</p>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-center text-lg font-mono"
                value={connectCode}
                onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnectModal(false)}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={connectWithCode}
              disabled={connectCode.length !== 6 || loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Detail Modal */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPartner?.name}</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedPartner.avatar}
                alt={selectedPartner.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{selectedPartner.name}</h3>
                <p className="text-white/60">{selectedPartner.email}</p>
                <p className="text-white/40">{selectedPartner.lastSeen}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">Score: {selectedPartner.safetyScore}</span>
                  </div>
                  {selectedPartner.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-blue-400 mr-1" />
                      <span className="text-sm text-blue-400">
                        {calculateDistance(selectedPartner.location)?.toFixed(1) || '0.0'} km away
                      </span>
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    selectedPartner.connectionStatus === 'connected' ? 'bg-green-600/20 text-green-400' :
                    selectedPartner.connectionStatus === 'pending' ? 'bg-orange-600/20 text-orange-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {selectedPartner.connectionStatus}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => handleDeletePartner(selectedPartner.id)}
                className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </motion.button>
            </div>

            {/* Partner Location Map */}
            {selectedPartner.location && selectedPartner.connectionStatus === 'connected' && (
              <PartnerMiniMap
                partner={selectedPartner}
                isExpanded={true}
                onToggleExpand={() => {}}
              />
            )}

            {/* Status Controls */}
            {selectedPartner.connectionStatus === 'connected' && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updatePartnerStatus(selectedPartner.id, 'online')}
                  className={`p-2 rounded-lg text-sm ${
                    selectedPartner.status === 'online' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  Online
                </button>
                <button
                  onClick={() => updatePartnerStatus(selectedPartner.id, 'sharing')}
                  className={`p-2 rounded-lg text-sm ${
                    selectedPartner.status === 'sharing' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  Sharing
                </button>
                <button
                  onClick={() => updatePartnerStatus(selectedPartner.id, 'offline')}
                  className={`p-2 rounded-lg text-sm ${
                    selectedPartner.status === 'offline' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  Offline
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center border-white/20 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => openMessaging(selectedPartner)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </Button>
              <Button className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <MapPin className="w-5 h-5 mr-2" />
                Navigate
              </Button>
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessaging}
        onClose={closeMessaging}
        partner={messagingPartner}
        currentUser={userData}
      />

      <SOSFloatingButton onClick={handleSOSClick} />
      <NavbarBottom />
    </div>
  );
};

export default Partners;