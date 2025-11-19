import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Battery, Gauge, Navigation, ToggleLeft, ToggleRight, Cloud, Sun, Users, Share2, Eye, Crosshair } from 'lucide-react';
import MapSystem from '../components/ui/MapSystem';
import GlassCard from '../components/ui/GlassCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import NavbarBottom from '../components/navigation/NavbarBottom';
import SOSFloatingButton from '../components/ui/SOSFloatingButton';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, getPartners, getPendingInvitations, acceptPartnerInvitation, addPartner, findUserByEmail, addHistoryEvent } from '../services/firebaseService';
import locationService from '../services/locationService';
import emailService from '../services/emailService';
import InvitationNotification from '../components/ui/InvitationNotification';
import 'leaflet/dist/leaflet.css';



const Dashboard = () => {
  const [isLiveSharing, setIsLiveSharing] = useState(false);
  const [locationData, setLocationData] = useState({
    speed: 0,
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 5,
    battery: 85
  });
  const [partners, setPartners] = useState([]);
  const [userData, setUserData] = useState({});
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [sharingStats, setSharingStats] = useState({
    sharingWith: 0,
    sharingWithMe: 0,
    totalConnections: 0
  });
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    loadUserData();
    loadPartners();
    loadPendingInvitations();
    startLocationTracking();
    
    return () => {
      locationService.stopWatching();
    };
  }, []);

  const loadPendingInvitations = async () => {
    if (userData.email) {
      try {
        const invitations = await getPendingInvitations(userData.email);
        setPendingInvitations(invitations);
      } catch (error) {
        console.error('Error loading invitations:', error);
      }
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await acceptPartnerInvitation(invitationId, userId);
      
      // Find the invitation to get sender info
      const invitation = pendingInvitations.find(inv => inv.id === invitationId);
      if (invitation) {
        const senderUser = await findUserByEmail(invitation.fromEmail || '');
        
        if (senderUser) {
          // Add sender as partner
          const currentLocation = await locationService.getCurrentPosition().catch(() => null);
          
          const partnerData = {
            userId: senderUser.id,
            name: senderUser.name,
            email: senderUser.email,
            avatar: senderUser.avatar,
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
          
          // Add current user as partner to sender
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
            connectedAt: new Date().toISOString()
          };
          
          await addPartner(senderUser.id, currentUserPartnerData);
          
          // Send confirmation emails
          await emailService.sendConnectionConfirmation(senderUser.email, userData.name);
          
          // Log connection event
          await addHistoryEvent(userId, {
            type: 'partner',
            title: 'Partner Connection Accepted',
            description: `Connected with ${senderUser.name}`,
            timestamp: new Date().toISOString(),
            status: 'connected'
          });
        }
      }
      
      loadPendingInvitations();
      loadPartners();
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      // In a real app, you'd update the invitation status to 'declined'
      const updatedInvitations = pendingInvitations.filter(inv => inv.id !== invitationId);
      setPendingInvitations(updatedInvitations);
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      // Get initial position
      const position = await locationService.getCurrentPosition();
      setLocationData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng,
        accuracy: position.accuracy,
        speed: position.speed || 0
      }));

      // Start watching position
      locationService.startWatching(async (position, error) => {
        if (error) {
          console.error('Location error:', error);
          return;
        }
        
        if (position) {
          setLocationData(prev => ({
            ...prev,
            latitude: position.lat,
            longitude: position.lng,
            accuracy: position.accuracy,
            speed: position.speed || 0,
            battery: navigator.getBattery ? prev.battery : Math.floor(Math.random() * 100)
          }));

          // Share location if sharing is enabled
          if (isLiveSharing) {
            await locationService.shareLocationWithPartners();
          }
        }
      });

      // Update battery info if available
      if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
          setLocationData(prev => ({
            ...prev,
            battery: Math.floor(battery.level * 100)
          }));
          
          battery.addEventListener('levelchange', () => {
            setLocationData(prev => ({
              ...prev,
              battery: Math.floor(battery.level * 100)
            }));
          });
        });
      }
      
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      // Fallback to default location
    }
  };

  const loadUserData = async () => {
    try {
      const user = await getUser(userId);
      if (user) {
        setUserData(user);
        setIsLiveSharing(user.isSharing || false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPartners = async () => {
    try {
      const partnersData = await getPartners(userId);
      setPartners(partnersData);
      updateSharingStats(partnersData);
    } catch (error) {
      console.error('Error loading partners:', error);
    }
  };

  const updateSharingStats = (partnersData = partners) => {
    const sharingWith = partnersData.filter(p => p.isSharing && isLiveSharing).length;
    const sharingWithMe = partnersData.filter(p => p.status === 'sharing').length;
    const totalConnections = partnersData.filter(p => p.connectionStatus === 'connected').length;
    
    setSharingStats({
      sharingWith,
      sharingWithMe,
      totalConnections
    });
  };

  const handleSOSClick = () => {
    navigate('/sos');
  };

  const toggleLiveSharing = async () => {
    const newSharingState = !isLiveSharing;
    setIsLiveSharing(newSharingState);
    
    try {
      // Set user details in location service
      locationService.setUserDetails({
        id: userId,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar
      });

      if (newSharingState) {
        // Enable sharing with connected partners
        const connectedPartners = partners.filter(p => p.connectionStatus === 'connected');
        locationService.enableSharing(connectedPartners);
        
        // Share current location
        await locationService.shareLocationWithPartners();
      } else {
        // Disable sharing
        locationService.disableSharing();
      }

      // Update user's sharing status in Firebase
      await updateUser(userId, { 
        isSharing: newSharingState,
        lastLocation: {
          lat: locationData.latitude,
          lng: locationData.longitude,
          timestamp: new Date().toISOString()
        }
      });
      
      // Update sharing stats
      updateSharingStats();
      
      console.log('Location sharing toggled:', newSharingState ? 'ON' : 'OFF');
    } catch (error) {
      console.error('Error toggling sharing:', error);
      setIsLiveSharing(!newSharingState); // Revert on error
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const onlinePartners = partners.filter(p => p.status === 'online' || p.status === 'sharing');

  return (
    <div className="min-h-screen pb-20">
      {/* Header with curved map */}
      <motion.div
        className="relative h-80 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-t-3xl z-20 shadow-2xl" />
        
        {/* Live Location Button */}
        <Button
          size="icon"
          className="absolute top-4 right-4 z-30 bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-md"
          onClick={() => {
            if (window.dashboardMap) {
              window.dashboardMap.setView([locationData.latitude, locationData.longitude], 15);
            }
          }}
        >
          <Crosshair className="w-5 h-5 text-white" />
        </Button>
        
        <MapSystem
          userLocation={{ lat: locationData.latitude, lng: locationData.longitude }}
          partners={partners}
          emergencyMode={false}
          onLocationUpdate={(location) => {
            setLocationData(prev => ({
              ...prev,
              latitude: location.lat,
              longitude: location.lng
            }));
          }}
        />

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{getGreeting()}</h1>
              <p className="text-white/80">{userData.name ? `${userData.name}, stay safe out there` : 'Stay safe out there'}</p>
            </div>
            <div className="glass-card p-3">
              <Sun className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <div className="px-6 -mt-4 relative z-30 space-y-6">
        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            {pendingInvitations.map((invitation) => (
              <InvitationNotification
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAcceptInvitation}
                onDecline={handleDeclineInvitation}
              />
            ))}
          </motion.div>
        )}
        {/* Sharing Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-4">
                <Share2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{sharingStats.sharingWith}</p>
                <p className="text-xs text-white/60">Sharing With</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-4">
                <Eye className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{sharingStats.sharingWithMe}</p>
                <p className="text-xs text-white/60">Sharing With Me</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-4">
                <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{sharingStats.totalConnections}</p>
                <p className="text-xs text-white/60">Connected</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Live Sharing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Live Location Sharing</h3>
              <p className="text-sm text-white/60">
                {isLiveSharing ? `Broadcasting to ${partners.length} partners` : 'Share your location with partners'}
              </p>
            </div>
            <motion.button
              className={`p-2 rounded-full ${isLiveSharing ? 'text-green-400' : 'text-white/40'}`}
              whileTap={{ scale: 0.9 }}
              onClick={toggleLiveSharing}
            >
              {isLiveSharing ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </motion.button>
          </GlassCard>
        </motion.div>

        {/* Partners Status */}
        {partners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Safety Partners
                </h3>
                <span className="text-sm text-white/60">{onlinePartners.length}/{partners.length} active</span>
              </div>
              <div className="flex space-x-3 overflow-x-auto">
                {partners.slice(0, 5).map(partner => (
                  <div key={partner.id} className="flex-shrink-0 text-center">
                    <div className="relative">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        partner.status === 'online' ? 'bg-green-400' :
                        partner.status === 'sharing' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-white/60 mt-1 truncate w-12">{partner.name?.split(' ')[0] || 'Partner'}</p>
                  </div>
                ))}
                {partners.length > 5 && (
                  <div className="flex-shrink-0 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white/60 text-sm">+{partners.length - 5}</span>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Location Metrics Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="text-center">
            <Gauge className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{locationData.speed.toFixed(1)}</p>
            <p className="text-sm text-white/60">mph</p>
          </GlassCard>

          <GlassCard className="text-center">
            <Battery className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{Math.floor(locationData.battery)}%</p>
            <p className="text-sm text-white/60">Battery</p>
          </GlassCard>

          <GlassCard className="text-center">
            <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{locationData.latitude.toFixed(4)}</p>
            <p className="text-sm text-white/60">Latitude</p>
          </GlassCard>

          <GlassCard className="text-center">
            <Navigation className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{locationData.longitude.toFixed(4)}</p>
            <p className="text-sm text-white/60">Longitude</p>
          </GlassCard>
        </motion.div>
      </div>

      <SOSFloatingButton onClick={handleSOSClick} />
      <NavbarBottom />
    </div>
  );
};

export default Dashboard;