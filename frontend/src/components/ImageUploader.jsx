import React, { useState, useRef, useEffect } from 'react';
import { extractMetadata, stripMetadata } from '../services/apiService';
import MetadataViewer from './MetadataViewer';
import ErrorMessage from './ErrorMessage';
import { 
  saveImageData, 
  loadImageData, 
  clearImageData, 
  fileToStorable, 
  storableToFile 
} from '../utils/storageUtils';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Load saved image on component mount
  useEffect(() => {
    const loadSavedImage = async () => {
      const savedData = await loadImageData();
      if (savedData) {
        const file = storableToFile(savedData.fileData);
        setSelectedFile(file);
        setPreviewUrl(savedData.fileData.dataUrl);
        
        // Restore metadata if it exists
        if (savedData.metadata) {
          setMetadata(savedData.metadata);
        }
      }
    };
    
    loadSavedImage();
  }, []);
  
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, BMP)');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setMetadata(null);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreviewUrl(reader.result);
      
      // Save to IndexedDB
      const storableFile = await fileToStorable(file);
      await saveImageData({
        fileData: storableFile,
        metadata: null
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleViewMetadata = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await extractMetadata(selectedFile);
      setMetadata(data);
      
      // Save metadata along with file
      const storableFile = await fileToStorable(selectedFile);
      await saveImageData({
        fileData: storableFile,
        metadata: data
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStripMetadata = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cleanedBlob = await stripMetadata(selectedFile);
      
      // Create download link
      const url = window.URL.createObjectURL(cleanedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cleaned_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setError(null);
      alert('Metadata stripped successfully! File downloaded.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = async () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMetadata(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear from IndexedDB
    await clearImageData();
  };
  
  return (
    <div className="image-uploader">
      <ErrorMessage message={error} onClose={() => setError(null)} />
      
      {!selectedFile ? (
        <div className="upload-section">
          <div className="upload-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp"
              className="file-input"
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              <span className="upload-icon">📁</span>
              <span className="upload-text">Choose an image file</span>
              <span className="upload-hint">
                Supported: JPG, PNG, GIF, BMP (Max 10MB)
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="image-preview-section">
          <div className="preview-header">
            <h3>Selected Image</h3>
            <button onClick={handleReset} className="btn-close" title="Remove image">
              ✕
            </button>
          </div>
          
          <div className="preview-container">
            <div className="preview-left">
              <div className="image-thumbnail">
                <img src={previewUrl} alt="Preview" />
              </div>
              <div className="image-info">
                <div className="info-row">
                  <span className="info-label">📄 File:</span>
                  <span className="info-value">{selectedFile.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📦 Size:</span>
                  <span className="info-value">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎨 Type:</span>
                  <span className="info-value">{selectedFile.type}</span>
                </div>
              </div>
            </div>
            
            <div className="preview-right">
              <div className="actions-container">
                <h4>What would you like to do?</h4>
                
                <div className="action-card" onClick={handleViewMetadata}>
                  <div className="action-icon">🔍</div>
                  <div className="action-content">
                    <h5>View Metadata</h5>
                    <p>See what information is embedded in your image</p>
                  </div>
                  <button
                    onClick={handleViewMetadata}
                    disabled={loading}
                    className="btn btn-action"
                  >
                    {loading ? 'Loading...' : 'View'}
                  </button>
                </div>
                
                <div className="action-card" onClick={handleStripMetadata}>
                  <div className="action-icon">🗑️</div>
                  <div className="action-content">
                    <h5>Strip & Download</h5>
                    <p>Remove all metadata and download clean image</p>
                  </div>
                  <button
                    onClick={handleStripMetadata}
                    disabled={loading}
                    className="btn btn-action btn-primary"
                  >
                    {loading ? 'Processing...' : 'Strip'}
                  </button>
                </div>
                
                <div className="action-card" onClick={handleReset}>
                  <div className="action-icon">🔄</div>
                  <div className="action-content">
                    <h5>Choose Another</h5>
                    <p>Select a different image to process</p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="btn btn-action btn-secondary"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <MetadataViewer metadata={metadata} />
    </div>
  );
};

export default ImageUploader;