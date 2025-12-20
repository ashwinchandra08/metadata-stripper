import React, { useEffect, useState } from 'react';
import ImageUploader from './components/ImageUploader';
import { checkHealth } from './services/apiService';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  
  useEffect(() => {
    const verifyApi = async () => {
      try {
        await checkHealth();
        setApiStatus('connected');
      } catch (error) {
        setApiStatus('disconnected');
      }
    };
    
    verifyApi();
  }, []);
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>🔒 Metadata Stripper</h1>
        <p className="app-subtitle">
          Remove EXIF data from your photos before sharing
        </p>
        <div className={`api-status status-${apiStatus}`}>
          <span className="status-dot"></span>
          <span>
            API: {apiStatus === 'checking' ? 'Checking...' : 
                 apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>
      
      <main className="app-main">
        <ImageUploader />
        
        <div className="info-section">
          <h2>Why Remove Metadata?</h2>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">📍</span>
              <h3>Location Privacy</h3>
              <p>Photos often contain GPS coordinates showing exactly where they were taken</p>
            </div>
            <div className="info-card">
              <span className="info-icon">📅</span>
              <h3>Timestamp Information</h3>
              <p>Date and time stamps can reveal when and where you were</p>
            </div>
            <div className="info-card">
              <span className="info-icon">📷</span>
              <h3>Device Details</h3>
              <p>Camera model, settings, and software information can be extracted</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>All processing happens locally. Your images are not stored.</p>
      </footer>
    </div>
  );
}

export default App;