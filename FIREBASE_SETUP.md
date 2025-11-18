# 🔧 Firebase Setup Guide

## Fix Google Sign-in "Unauthorized Domain" Error

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **safeguard-93c61**

### Step 2: Add Authorized Domains
1. Navigate to **Authentication** → **Settings** → **Authorized domains** tab
2. Click **Add domain**
3. Add these domains one by one:

```
safe-guard-bwuuip3bk-sanjeevans-projects-45db636c.vercel.app
localhost
127.0.0.1
```

### Step 3: Save Changes
1. Click **Save** after adding each domain
2. Wait 5-10 minutes for changes to propagate

### Step 4: Test Google Sign-in
1. Go to your deployed app
2. Try Google sign-in - it should work now!

## Current Deployment URLs
- **Vercel**: https://safe-guard-bwuuip3bk-sanjeevans-projects-45db636c.vercel.app
- **Firebase**: https://safeguard-93c61.web.app

## Alternative: Use Email/Password
If you prefer not to set up Google sign-in:
- Users can create accounts with email/password
- All features work the same way
- No additional setup required

## Need Help?
- Check browser console for detailed error messages
- Ensure Firebase project is active
- Verify domain spelling matches exactly