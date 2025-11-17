import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Suppress React DevTools message
if (typeof console !== 'undefined') {
  const originalLog = console.log;
  console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('React DevTools')) {
      return;
    }
    originalLog.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)