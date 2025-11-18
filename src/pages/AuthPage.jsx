import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, isDemoMode } from '../firebase';
import { createUser, updateUser } from '../services/firebaseService';
import GradientButton from '../components/ui/GradientButton';
import GlassCard from '../components/ui/GlassCard';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin && !formData.name) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode) {
        // Demo mode - simulate authentication
        const userId = generateUserId();
        const inviteCode = generateInviteCode();
        
        if (!isLogin) {
          const userData = {
            name: formData.name,
            email: formData.email,
            inviteCode: inviteCode,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=8b5cf6&color=fff`,
            isOnline: true,
            isSharing: false,
            emergencyContacts: []
          };
          await createUser(userId, userData);
        }
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', userId);
        navigate('/dashboard');
        return;
      }

      let userCredential;
      
      if (isLogin) {
        // Firebase email/password login
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // Firebase email/password signup
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Create user profile in Firestore
        const inviteCode = generateInviteCode();
        const userData = {
          name: formData.name,
          email: formData.email,
          inviteCode: inviteCode,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=8b5cf6&color=fff`,
          isOnline: true,
          isSharing: false,
          emergencyContacts: []
        };
        
        await createUser(userCredential.user.uid, userData);
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', userCredential.user.uid);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setErrors({ general: errorMessage });
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (isDemoMode) {
      setErrors({ general: 'Google sign-in requires Firebase setup. Please configure your Firebase credentials.' });
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user exists in Firestore, if not create profile
      const inviteCode = generateInviteCode();
      const userData = {
        name: user.displayName || 'Google User',
        email: user.email,
        inviteCode: inviteCode,
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=8b5cf6&color=fff`,
        isOnline: true,
        isSharing: false,
        emergencyContacts: []
      };
      
      await createUser(user.uid, userData);
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', user.uid);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setErrors({ general: 'Please add this domain to Firebase authorized domains. See console for details.' });
        console.log('🔧 FIREBASE SETUP REQUIRED:');
        console.log('1. Go to Firebase Console: https://console.firebase.google.com');
        console.log('2. Select your project: safeguard-93c61');
        console.log('3. Go to Authentication > Settings > Authorized domains');
        console.log('4. Add these domains:');
        console.log('   - safe-guard-bwuuip3bk-sanjeevans-projects-45db636c.vercel.app');
        console.log('   - localhost');
        console.log('5. Save and try Google sign-in again');
      } else {
        setErrors({ general: 'Google sign-in failed. Please try again.' });
      }
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">SafeGuard</h1>
          <p className="text-white/60 mt-2">Your Personal Safety Companion</p>
        </motion.div>

        <GlassCard>
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin ? 'bg-purple-600 text-white' : 'text-white/60'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin ? 'bg-purple-600 text-white' : 'text-white/60'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={`floating-input pl-12 ${errors.name ? 'animate-shake border-red-500' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="email"
                placeholder="Email Address"
                className={`floating-input pl-12 ${errors.email ? 'animate-shake border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={`floating-input pl-12 pr-12 ${errors.password ? 'animate-shake border-red-500' : ''}`}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}

            <GradientButton 
              type="submit" 
              className="w-full mt-6" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </GradientButton>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {!isDemoMode ? (
                <GradientButton 
                  variant="secondary" 
                  className="w-full flex items-center justify-center"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </GradientButton>
              ) : (
                <div className="p-3 bg-orange-600/20 border border-orange-600/30 rounded-lg text-center">
                  <p className="text-orange-400 text-sm">
                    Google sign-in requires Firebase setup.<br/>
                    Add your Firebase credentials to .env file to enable.
                  </p>
                </div>
              )}
            </div>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm">
                Forgot Password?
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AuthPage;