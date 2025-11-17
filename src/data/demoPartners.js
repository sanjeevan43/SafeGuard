// Demo partners with locations for testing
export const demoPartners = [
  {
    id: 'demo-partner-1',
    userId: 'demo-user-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    status: 'online',
    isSharing: true,
    lastSeen: 'Active now',
    safetyScore: 95,
    location: {
      lat: 40.7589,
      lng: -73.9851
    },
    connectionStatus: 'connected',
    connectedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-partner-2',
    userId: 'demo-user-2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'sharing',
    isSharing: true,
    lastSeen: '2 min ago',
    safetyScore: 88,
    location: {
      lat: 40.7505,
      lng: -73.9934
    },
    connectionStatus: 'connected',
    connectedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'demo-partner-3',
    userId: 'demo-user-3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'offline',
    isSharing: false,
    lastSeen: '1 hour ago',
    safetyScore: 92,
    location: {
      lat: 40.7614,
      lng: -73.9776
    },
    connectionStatus: 'connected',
    connectedAt: new Date(Date.now() - 259200000).toISOString()
  }
];

export const addDemoPartners = async (userId, addPartnerFunction) => {
  try {
    for (const partner of demoPartners) {
      await addPartnerFunction(userId, partner);
    }
    console.log('Demo partners added successfully');
  } catch (error) {
    console.error('Error adding demo partners:', error);
  }
};