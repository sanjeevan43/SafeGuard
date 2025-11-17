import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/ui/GradientButton';

const OnboardingScreen = ({ icon: Icon, title, description, isLast, onNext, onSkip }) => (
  <motion.div
    className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <motion.div
      className="mb-12"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-8 shadow-2xl">
        <Icon className="w-16 h-16 text-white" />
      </div>
    </motion.div>
    
    <h1 className="text-3xl font-bold text-gradient mb-6">{title}</h1>
    <p className="text-lg text-white/80 mb-12 max-w-md leading-relaxed">{description}</p>
    
    <div className="space-y-4 w-full max-w-xs">
      <GradientButton onClick={onNext} className="w-full">
        {isLast ? 'Get Started' : 'Continue'}
        <ChevronRight className="w-5 h-5 ml-2" />
      </GradientButton>
      
      {!isLast && (
        <button
          onClick={onSkip}
          className="w-full py-3 text-white/60 hover:text-white transition-colors"
        >
          Skip
        </button>
      )}
    </div>
  </motion.div>
);

const Onboarding = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const screens = [
    {
      icon: Shield,
      title: "Stay Protected",
      description: "Your personal safety companion that keeps you connected with loved ones in real-time."
    },
    {
      icon: Users,
      title: "Connect Safely",
      description: "Share your location with trusted partners and receive instant alerts when they need help."
    },
    {
      icon: MapPin,
      title: "Track & Monitor",
      description: "Advanced location tracking with offline mode ensures you're never truly alone."
    }
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate('/auth');
    }
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        <OnboardingScreen
          key={currentScreen}
          {...screens[currentScreen]}
          isLast={currentScreen === screens.length - 1}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </AnimatePresence>
      
      {/* Progress Indicators */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {screens.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentScreen ? 'bg-purple-400' : 'bg-white/30'
            }`}
            animate={{ scale: index === currentScreen ? 1.2 : 1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;