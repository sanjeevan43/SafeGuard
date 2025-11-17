import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isDemoMode } from '../firebase';

// Mock data for demo mode
const mockUsers = new Map();
const mockPartners = new Map();
const mockHistory = new Map();

// Demo mode helpers
const generateMockTimestamp = () => new Date().toISOString();

// User operations
export const createUser = async (userId, userData) => {
  if (isDemoMode || !db) {
    mockUsers.set(userId, {
      ...userData,
      createdAt: generateMockTimestamp(),
      isOnline: true,
      isSharing: false
    });
    return true;
  }

  try {
    const existingUser = await getDoc(doc(db, 'users', userId));
    
    if (existingUser.exists()) {
      await updateDoc(doc(db, 'users', userId), {
        isOnline: true,
        lastLoginAt: serverTimestamp()
      });
      return true;
    }
    
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      isOnline: true,
      isSharing: false
    });
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
};

export const getUser = async (userId) => {
  if (isDemoMode || !db) {
    let user = mockUsers.get(userId);
    if (!user) {
      user = {
        name: 'Demo User',
        email: 'demo@safeguard.app',
        phone: '+1234567890',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        emergencyContacts: [],
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: generateMockTimestamp(),
        isOnline: true,
        isSharing: false
      };
      mockUsers.set(userId, user);
    }
    return { id: userId, ...user };
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error('Error getting user:', error);
    // Fallback to local storage for permissions errors
    let user = mockUsers.get(userId);
    if (!user) {
      user = {
        name: 'Demo User',
        email: 'demo@safeguard.app',
        phone: '+1234567890',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        emergencyContacts: [],
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: generateMockTimestamp(),
        isOnline: true,
        isSharing: false
      };
      mockUsers.set(userId, user);
    }
    return { id: userId, ...user };
  }
};

export const updateUser = async (userId, userData) => {
  if (isDemoMode || !db) {
    const existing = mockUsers.get(userId) || {};
    mockUsers.set(userId, {
      ...existing,
      ...userData,
      updatedAt: generateMockTimestamp()
    });
    return true;
  }

  try {
    // Check if document exists first
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      // Document exists, update it
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    // Fallback to demo mode
    const existing = mockUsers.get(userId) || {};
    mockUsers.set(userId, {
      ...existing,
      ...userData,
      updatedAt: generateMockTimestamp()
    });
    return true;
  }
};

// Partner operations
export const addPartner = async (userId, partnerData) => {
  if (isDemoMode || !db) {
    const partnerId = 'partner_' + Date.now();
    const userPartners = mockPartners.get(userId) || [];
    userPartners.push({
      id: partnerId,
      ...partnerData,
      createdAt: generateMockTimestamp(),
      connectionStatus: 'connected'
    });
    mockPartners.set(userId, userPartners);
    return partnerId;
  }

  try {
    const partnerRef = doc(collection(db, 'users', userId, 'partners'));
    await setDoc(partnerRef, {
      ...partnerData,
      createdAt: serverTimestamp(),
      connectionStatus: 'pending'
    });
    return partnerRef.id;
  } catch (error) {
    console.error('Error adding partner:', error);
    return null;
  }
};

export const getPartners = async (userId) => {
  if (isDemoMode || !db) {
    return mockPartners.get(userId) || [];
  }

  try {
    const partnersSnapshot = await getDocs(collection(db, 'users', userId, 'partners'));
    return partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting partners:', error);
    // Fallback to local storage for permissions errors
    return mockPartners.get(userId) || [];
  }
};

export const updatePartner = async (userId, partnerId, partnerData) => {
  if (isDemoMode || !db) {
    const userPartners = mockPartners.get(userId) || [];
    const partnerIndex = userPartners.findIndex(p => p.id === partnerId);
    if (partnerIndex !== -1) {
      userPartners[partnerIndex] = { ...userPartners[partnerIndex], ...partnerData };
      mockPartners.set(userId, userPartners);
    }
    return true;
  }

  try {
    await updateDoc(doc(db, 'users', userId, 'partners', partnerId), {
      ...partnerData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating partner:', error);
    return false;
  }
};

export const deletePartner = async (userId, partnerId) => {
  if (isDemoMode || !db) {
    const userPartners = mockPartners.get(userId) || [];
    const filteredPartners = userPartners.filter(p => p.id !== partnerId);
    mockPartners.set(userId, filteredPartners);
    return true;
  }

  try {
    await deleteDoc(doc(db, 'users', userId, 'partners', partnerId));
    return true;
  } catch (error) {
    console.error('Error deleting partner:', error);
    return false;
  }
};

// Connection operations
export const findUserByInviteCode = async (inviteCode) => {
  if (isDemoMode || !db) {
    for (const [userId, userData] of mockUsers.entries()) {
      if (userData.inviteCode === inviteCode) {
        return { id: userId, ...userData };
      }
    }
    return null;
  }

  try {
    const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  } catch (error) {
    console.error('Error finding user by invite code:', error);
    return null;
  }
};

export const findUserByEmail = async (email) => {
  if (isDemoMode || !db) {
    for (const [userId, userData] of mockUsers.entries()) {
      if (userData.email === email) {
        return { id: userId, ...userData };
      }
    }
    return null;
  }

  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

export const sendPartnerInvitation = async (fromUserId, toEmail, message = '') => {
  if (isDemoMode || !db) {
    const invitationId = 'invite_' + Date.now();
    const mockInvitations = JSON.parse(localStorage.getItem('mockInvitations') || '[]');
    mockInvitations.push({
      id: invitationId,
      fromUserId,
      toEmail,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('mockInvitations', JSON.stringify(mockInvitations));
    return invitationId;
  }

  try {
    const invitationRef = doc(collection(db, 'invitations'));
    await setDoc(invitationRef, {
      fromUserId,
      toEmail,
      message,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return invitationRef.id;
  } catch (error) {
    console.error('Error sending invitation:', error);
    return null;
  }
};

export const getPendingInvitations = async (userEmail) => {
  if (isDemoMode || !db) {
    const mockInvitations = JSON.parse(localStorage.getItem('mockInvitations') || '[]');
    return mockInvitations.filter(inv => inv.toEmail === userEmail && inv.status === 'pending');
  }

  try {
    const q = query(
      collection(db, 'invitations'), 
      where('toEmail', '==', userEmail),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting invitations:', error);
    return [];
  }
};

export const acceptPartnerInvitation = async (invitationId, userId) => {
  if (isDemoMode || !db) {
    const mockInvitations = JSON.parse(localStorage.getItem('mockInvitations') || '[]');
    const invIndex = mockInvitations.findIndex(inv => inv.id === invitationId);
    if (invIndex !== -1) {
      mockInvitations[invIndex].status = 'accepted';
      localStorage.setItem('mockInvitations', JSON.stringify(mockInvitations));
      return true;
    }
    return false;
  }

  try {
    await updateDoc(doc(db, 'invitations', invitationId), {
      status: 'accepted',
      acceptedBy: userId,
      acceptedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
};

// History operations
export const addHistoryEvent = async (userId, eventData) => {
  if (isDemoMode || !db) {
    const userHistory = mockHistory.get(userId) || [];
    const eventId = 'event_' + Date.now();
    userHistory.push({
      id: eventId,
      ...eventData,
      createdAt: generateMockTimestamp()
    });
    mockHistory.set(userId, userHistory);
    return eventId;
  }

  try {
    const historyRef = doc(collection(db, 'users', userId, 'history'));
    await setDoc(historyRef, {
      ...eventData,
      createdAt: serverTimestamp()
    });
    return historyRef.id;
  } catch (error) {
    console.error('Error adding history event:', error);
    return null;
  }
};

export const getHistory = async (userId) => {
  if (isDemoMode || !db) {
    return mockHistory.get(userId) || [];
  }

  try {
    const historySnapshot = await getDocs(collection(db, 'users', userId, 'history'));
    return historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

// Real-time listeners
export const listenToPartners = (userId, callback) => {
  if (isDemoMode || !db) {
    // Mock real-time updates
    callback(mockPartners.get(userId) || []);
    return () => {}; // Return unsubscribe function
  }

  return onSnapshot(collection(db, 'users', userId, 'partners'), (snapshot) => {
    const partners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(partners);
  });
};

export const listenToUser = (userId, callback) => {
  if (isDemoMode || !db) {
    // Mock real-time updates
    const user = mockUsers.get(userId);
    if (user) {
      callback({ id: userId, ...user });
    }
    return () => {}; // Return unsubscribe function
  }

  return onSnapshot(doc(db, 'users', userId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};