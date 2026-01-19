import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ImageUploader from './components/ImageUploader';
import Privacy from './components/Privacy';
import { checkHealth } from './services/apiService';
import './App.css';
import { MdPrivacyTip, MdOutlineLanguage} from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { FaCalendarAlt, FaCameraRetro } from "react-icons/fa";

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
  <Router>
    <Routes>
      <Route path="/" element={
    <div className="app-redesigned">
      {/* Header */}
      <header className="app-header-redesigned">
        <div className="header-container">
          <div className="logo-section">
             <div className="logo-image-wrapper">
              <img src="/logo_2.png" alt="Metadata Stripper" className="logo-image" />
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
              <Link to="/privacyPolicy" className="icon-btn" title="Privacy Policy" aria-label="Privacy">
                <MdPrivacyTip/>
              </Link>
              <button className="icon-btn" title="Language" aria-label="Language">
                <MdOutlineLanguage />
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
            <h2>Erase Image Metadata</h2>
            <p className="page-subtitle">One-click EXIF metadata remover for safer file sharing.</p>
          </div>
          
          <ImageUploader />
          
          {/* Info Section - Below the uploader */}
          <div className="info-section-redesigned">
            <h3>Why Remove Metadata?</h3>
            <div className="info-grid-redesigned">
              <div className="info-card-redesigned">
                <CiLocationOn className="info-icon-redesigned" color="#6b9d6f"/>
                <h4>Location Privacy</h4>
                <p>Photos contain GPS coordinates revealing exactly where they were taken</p>
              </div>
              <div className="info-card-redesigned">
                <FaCalendarAlt className="info-icon-redesigned" color="#6b9d6f"/>
                <h4>Timestamp Information</h4>
                <p>Date and time stamps can reveal when and where you were</p>
              </div>
              <div className="info-card-redesigned">
                <FaCameraRetro className="info-icon-redesigned" color="#6b9d6f"/>
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
      } />
      <Route path="/privacyPolicy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}

export default App;