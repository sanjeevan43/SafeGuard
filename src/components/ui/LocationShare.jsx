import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationShare = ({ userLocation }) => {
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const shareLocation = async () => {
    if (!shareEmail || !userLocation) return;
    
    try {
      // Demo mode - just show success message
      setShareMessage('Location shared successfully!');
      setShareEmail('');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      setShareMessage('Error sharing location');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-emerald-900/20 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 backdrop-blur-md border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-green-600/5"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🔗</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Share Location</h3>
              <p className="text-white/60 text-sm">Grant secure access to trusted contacts</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Form */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter trusted contact email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition-all duration-300 text-white placeholder-white/40 text-base backdrop-blur-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-white/30 text-sm">✉️</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={shareLocation}
            disabled={!shareEmail || !userLocation}
            className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 p-4 text-white font-semibold text-base shadow-lg hover:shadow-emerald-500/25 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>Grant Secure Access</span>
            </div>
          </button>
        </div>
        
        {shareMessage && (
          <div className="mt-6 relative overflow-hidden rounded-2xl bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5"></div>
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold">{shareMessage}</p>
                  <p className="text-emerald-300/60 text-sm">Location access granted successfully</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationShare;