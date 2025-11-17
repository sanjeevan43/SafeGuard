import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Shield, AlertTriangle, MapPin, Users, CheckCircle, Clock } from 'lucide-react';
import NavbarBottom from '../components/navigation/NavbarBottom';
import SOSFloatingButton from '../components/ui/SOSFloatingButton';
import GlassCard from '../components/ui/GlassCard';
import TimelineItem from '../components/ui/TimelineItem';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/firebaseService';

const History = () => {
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const events = await getHistory(userId);
      // Sort by timestamp (newest first)
      const sortedEvents = events.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
      setHistoryEvents(sortedEvents);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSOSClick = () => {
    navigate('/sos');
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'safety': return CheckCircle;
      case 'location': return MapPin;
      case 'partner': return Users;
      default: return Shield;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'emergency': return 'text-red-400';
      case 'safety': return 'text-green-400';
      case 'location': return 'text-blue-400';
      case 'partner': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const filteredEvents = filter === 'all' 
    ? historyEvents 
    : historyEvents.filter(event => event.type === filter);

  const eventTypes = [
    { key: 'all', label: 'All Events', count: historyEvents.length },
    { key: 'emergency', label: 'Emergency', count: historyEvents.filter(e => e.type === 'emergency').length },
    { key: 'safety', label: 'Safety', count: historyEvents.filter(e => e.type === 'safety').length },
    { key: 'location', label: 'Location', count: historyEvents.filter(e => e.type === 'location').length },
    { key: 'partner', label: 'Partners', count: historyEvents.filter(e => e.type === 'partner').length }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Safety History</h1>
          <p className="text-white/60">Track your safety activities and alerts</p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex space-x-2 overflow-x-auto">
            {eventTypes.map(type => (
              <button
                key={type.key}
                onClick={() => setFilter(type.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === type.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* History Timeline */}
      <div className="px-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading history...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);
              
              return (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg bg-white/10 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        <p className="text-white/60 text-sm mt-1">{event.description}</p>
                        {event.address && (
                          <p className="text-white/40 text-xs mt-2 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.address}
                          </p>
                        )}
                        <div className="flex items-center mt-3 text-xs text-white/40">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(event.timestamp || event.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {event.status && (
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          event.status === 'active' ? 'bg-red-600/20 text-red-400' :
                          event.status === 'safe' ? 'bg-green-600/20 text-green-400' :
                          event.status === 'cancelled' ? 'bg-gray-600/20 text-gray-400' :
                          'bg-blue-600/20 text-blue-400'
                        }`}>
                          {event.status}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <Shield className="w-20 h-20 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">No History Yet</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Your safety activities will appear here. Start by connecting with partners or using the SOS feature.
              </p>
            </GlassCard>
          </motion.div>
        )}
      </div>

      <SOSFloatingButton onClick={handleSOSClick} />
      <NavbarBottom />
    </div>
  );
};

export default History;