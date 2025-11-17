# SafeGuard - Personal Safety Tracking App

A premium, production-grade personal safety tracking application built with React + Vite, featuring glassmorphism design, smooth animations, and comprehensive safety features.

## 🚀 Features

### Core Functionality
- **Real-time Location Tracking** with interactive maps
- **SOS Emergency System** with countdown and alert notifications
- **Partner Management** for trusted contacts
- **Safety History Timeline** with detailed activity logs
- **Live Location Sharing** with toggle controls
- **Offline Mode Support** for emergency situations

### Premium UI/UX
- **Neo-glassmorphism Design** with depth and transparency
- **Smooth Framer Motion Animations** throughout the app
- **Responsive Mobile-First Design** optimized for all devices
- **Interactive Maps** powered by React-Leaflet
- **Premium Color Gradients** (purple → blue theme)
- **Floating SOS Button** with pulsing glow effect

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom glassmorphism components
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Maps**: React-Leaflet + OpenStreetMap
- **Icons**: Lucide React
- **State Management**: React Hooks + LocalStorage

## 📱 App Screens

1. **Onboarding** (3 screens with smooth transitions)
2. **Authentication** (Login/Signup with floating labels)
3. **Dashboard** (Map header + live metrics)
4. **Partners** (Contact management with search)
5. **SOS Center** (Emergency alert system)
6. **History** (Timeline view of activities)
7. **Settings** (Profile and preferences)

## 🎨 Design System

### Colors
- **Primary**: Purple (#8b5cf6) to Blue (#3b82f6) gradients
- **Glass**: Semi-transparent white overlays
- **Backgrounds**: Dark slate with purple accents
- **Status Colors**: Green (safe), Red (emergency), Blue (sharing)

### Components
- `GlassCard` - Glassmorphism container with hover effects
- `GradientButton` - Multi-variant button with animations
- `SOSFloatingButton` - Emergency button with pulsing glow
- `NavbarBottom` - 5-tab navigation with active states
- `Modal` - Blur background with smooth transitions
- `TimelineItem` - History display with icons and cards
- `PartnerCard` - Contact display with status indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd SafeGuard
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Open browser**
Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── GlassCard.jsx
│   │   ├── GradientButton.jsx
│   │   ├── SOSFloatingButton.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── Modal.jsx
│   │   ├── TimelineItem.jsx
│   │   └── PartnerCard.jsx
│   └── navigation/
│       └── NavbarBottom.jsx
├── pages/                  # Main app screens
│   ├── Onboarding.jsx
│   ├── AuthPage.jsx
│   ├── Dashboard.jsx
│   ├── Partners.jsx
│   ├── SOSCenter.jsx
│   ├── History.jsx
│   └── Settings.jsx
├── data/
│   └── sampleData.js      # Mock data for testing
├── styles/
│   └── index.css          # Global styles + Tailwind
└── App.jsx                # Main app with routing
```

## 🎯 Key Features Implemented

### Authentication Flow
- Onboarding screens with smooth animations
- Login/Signup forms with validation
- Protected routes with localStorage persistence

### Dashboard
- Interactive map with user location
- Live metrics (speed, coordinates, battery)
- Weather widget placeholder
- Live sharing toggle with animations

### SOS System
- Large emergency button with countdown
- Pulsing glow animations
- Emergency contact quick access
- "I'm Safe" confirmation system

### Partner Management
- Search and filter contacts
- Add partner modal
- Partner detail view with mini-map
- Live status indicators (online/offline/sharing)

### History Timeline
- Vertical timeline with activity markers
- Categorized events (SOS, check-in, location share)
- Date filtering and export options
- Activity statistics summary

### Settings
- Profile management with avatar
- Emergency contacts configuration
- Privacy and notification settings
- Gradient-bordered profile card

## 🎨 Animation Details

- **Page Transitions**: Fade and slide effects
- **Button Interactions**: Scale and ripple effects
- **SOS Button**: Continuous pulsing glow
- **Cards**: Hover tilt and scale effects
- **Navigation**: Active tab animations
- **Loading**: Rotating shield icon
- **Form Validation**: Shake animations for errors

## 📱 Responsive Design

- **Mobile-first approach** with touch-friendly interactions
- **Glassmorphism cards** adapt to different screen sizes
- **Bottom navigation** optimized for thumb navigation
- **Floating SOS button** positioned for easy access
- **Map interface** scales appropriately on all devices

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to modify the color palette:
```js
colors: {
  primary: { /* your colors */ },
  purple: { /* your colors */ },
  glass: 'rgba(255, 255, 255, 0.1)',
}
```

### Animations
Modify animations in `tailwind.config.js`:
```js
animation: {
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  'float': 'float 3s ease-in-out infinite',
}
```

## 🚀 Production Deployment

The app is ready for deployment to:
- **Vercel** (recommended for React apps)
- **Netlify** 
- **AWS S3 + CloudFront**
- **Firebase Hosting**

Build command: `npm run build`
Output directory: `dist/`

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**SafeGuard** - Your Personal Safety Companion 🛡️