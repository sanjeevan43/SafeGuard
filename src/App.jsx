import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import SOSCenter from './pages/SOSCenter';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={
            localStorage.getItem('isAuthenticated') ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/onboarding" replace />
          } />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/sos" element={<SOSCenter />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;