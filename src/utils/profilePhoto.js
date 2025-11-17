// Get user profile photo from Gmail/Google account
export const getGoogleProfilePhoto = (email, size = 150) => {
  if (!email) return null;
  
  // Google's profile photo API endpoint
  const baseUrl = 'https://www.googleapis.com/gmail/v1/users/me/profile';
  
  // Alternative: Use Gravatar as fallback
  const gravatarUrl = `https://www.gravatar.com/avatar/${btoa(email.toLowerCase())}?s=${size}&d=identicon`;
  
  // Google profile photo (requires authentication)
  const googlePhotoUrl = `https://lh3.googleusercontent.com/a/default-user=${size}`;
  
  return {
    gravatar: gravatarUrl,
    google: googlePhotoUrl
  };
};

// Simple function to get Gravatar (works without auth)
export const getGravatarPhoto = (email, size = 150) => {
  if (!email) return null;
  
  // Create MD5 hash of email (simplified version)
  const hash = btoa(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
};

// Get profile photo with fallback
export const getProfilePhoto = (email, size = 150) => {
  if (!email) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
  
  return getGravatarPhoto(email, size);
};