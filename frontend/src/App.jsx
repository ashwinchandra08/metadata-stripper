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
    <div className="app-redesigned">
      {/* Header */}
      <header className="app-header-redesigned">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 9h6v6H9z"/>
                <path d="M9 1v4M15 1v4M9 19v4M15 19v4M19 9h4M19 15h4M1 9h4M1 15h4"/>
              </svg>
            </div>
            <div className="brand-name">
              <h1>METADATA STRIPPER</h1>
            </div>
          </div>
          
         {/*
          <nav className="header-nav">
            <button className="nav-btn">
              <span className="nav-icon">⊞</span>
              All tools
              <span className="dropdown-arrow">▼</span>
            </button>
            */
         }

            <div className="header-actions">
              <button className="icon-btn" title="Help">
                <span>?</span>
              </button>
              <button className="icon-btn" title="Language">
                <span>🌐</span>
                EN
              </button>
              <div className={`status-indicator ${apiStatus}`} title={`API Status: ${apiStatus}`}>
                <span className="status-dot"></span>
              </div>
            </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="app-main-redesigned">
        <div className="content-wrapper">
          <div className="page-title">
            <h2>Metadata Remover</h2>
            <p className="page-subtitle">One-click EXIF metadata remover for safer file sharing.</p>
          </div>
          
          <ImageUploader />
          
          {/* Info Section - Below the uploader */}
          <div className="info-section-redesigned">
            <h3>Why Remove Metadata?</h3>
            <div className="info-grid-redesigned">
              <div className="info-card-redesigned">
                <div className="info-icon-redesigned">📍</div>
                <h4>Location Privacy</h4>
                <p>Photos contain GPS coordinates revealing exactly where they were taken</p>
              </div>
              <div className="info-card-redesigned">
                <div className="info-icon-redesigned">📅</div>
                <h4>Timestamp Information</h4>
                <p>Date and time stamps can reveal when and where you were</p>
              </div>
              <div className="info-card-redesigned">
                <div className="info-icon-redesigned">📷</div>
                <h4>Device Details</h4>
                <p>Camera model, settings, and software information can be extracted</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="app-footer-redesigned">
        <p>Your images are processed securely. No data is stored on our servers.</p>
      </footer>
    </div>
  );
}

export default App;