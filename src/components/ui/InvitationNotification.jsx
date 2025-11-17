import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Mail } from 'lucide-react';
import GradientButton from './GradientButton';
import GlassCard from './GlassCard';

const InvitationNotification = ({ invitation, onAccept, onDecline }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    await onAccept(invitation.id);
    setLoading(false);
  };

  const handleDecline = async () => {
    setLoading(true);
    await onDecline(invitation.id);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard className="p-4 border-l-4 border-l-blue-400">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">Partner Invitation</h4>
            <p className="text-white/60 text-sm mt-1">
              Someone wants to connect with you as a safety partner
            </p>
            {invitation.message && (
              <p className="text-white/80 text-sm mt-2 italic">
                "{invitation.message}"
              </p>
            )}
            <p className="text-white/40 text-xs mt-2">
              From: {invitation.fromEmail || 'SafeGuard User'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <GradientButton
            variant="secondary"
            onClick={handleDecline}
            className="flex-1 flex items-center justify-center"
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </GradientButton>
          <GradientButton
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center"
            disabled={loading}
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? 'Accepting...' : 'Accept'}
          </GradientButton>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default InvitationNotification;