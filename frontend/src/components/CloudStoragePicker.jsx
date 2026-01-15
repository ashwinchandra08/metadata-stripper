import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiDropbox, SiGoogledrive } from 'react-icons/si';
import { AiFillFolderOpen } from 'react-icons/ai';
import { BsLink45Deg } from 'react-icons/bs';
import { openGoogleDrivePicker, openDropboxChooser } from '../services/cloudStorageService';
import './CloudStoragePicker.css';

const CloudStoragePicker = ({ onFileSelect, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleGoogleDrive = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setLoadingProvider('google');
    try {
      await openGoogleDrivePicker((file) => {
        onFileSelect(file);
        setIsLoading(false);
        setLoadingProvider(null);
      });
      // Reset loading state after picker is dismissed
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProvider(null);
      }, 1000);
    } catch (error) {
      onError(error.message || 'Failed to open Google Drive picker');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleDropbox = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setLoadingProvider('dropbox');
    try {
      await openDropboxChooser((file) => {
        onFileSelect(file);
        setIsLoading(false);
        setLoadingProvider(null);
      });
      // Reset loading state after chooser is dismissed
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProvider(null);
      }, 1000);
    } catch (error) {
      onError(error.message || 'Failed to open Dropbox picker');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="cloud-storage-icons">
      <button 
        type="button"
        onClick={handleGoogleDrive}
        className="cloud-icon-btn"
        title="Import from Google Drive"
        disabled={isLoading}
      >
        {isLoading && loadingProvider === 'google' ? (
          <span className="loading-spinner-small">⏳</span>
        ) : (
          <SiGoogledrive size={20} color="#252825ff" />
        )}
      </button>
      
      <button 
        type="button"
        onClick={handleDropbox}
        className="cloud-icon-btn"
        title="Import from Dropbox"
        disabled={isLoading}
      >
        {isLoading && loadingProvider === 'dropbox' ? (
          <span className="loading-spinner-small">⏳</span>
        ) : (
          <SiDropbox size={20} color="#252825ff" />
        )}
      </button>

      <button 
        type="button"
        className="cloud-icon-btn"
        title="Import from URL (Coming soon)"
        disabled
      >
        <BsLink45Deg size={22} color="#718096" />
      </button>

      <button 
        type="button"
        className="cloud-icon-btn"
        title="More cloud options (Coming soon)"
        disabled
      >
        <AiFillFolderOpen size={20} color="#718096" />
      </button>
    </div>
  );
};

export default CloudStoragePicker;
