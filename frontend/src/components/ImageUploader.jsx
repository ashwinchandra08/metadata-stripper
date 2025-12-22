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
  const [dragActive, setDragActive] = useState(false);
  const [processingStep, setProcessingStep] = useState('idle'); // idle, viewing, stripping
  const fileInputRef = useRef(null);
  
  // Load saved image on component mount
  useEffect(() => {
    const loadSavedImage = async () => {
      const savedData = await loadImageData();
      if (savedData) {
        const file = storableToFile(savedData.fileData);
        setSelectedFile(file);
        setPreviewUrl(savedData.fileData.dataUrl);
        
        if (savedData.metadata) {
          setMetadata(savedData.metadata);
        }
      }
    };
    
    loadSavedImage();
  }, []);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = async (event) => {
    if (event.target.files && event.target.files[0]) {
      await handleFileUpload(event.target.files[0]);
    }
  };
  
  const handleFileUpload = async (file) => {
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
    setProcessingStep('idle');
    
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
    setProcessingStep('viewing');
    
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
      setProcessingStep('idle');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStripMetadata = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    setProcessingStep('stripping');
    
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
      setProcessingStep('idle');
    } catch (err) {
      setError(err.message);
      setProcessingStep('idle');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = async () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMetadata(null);
    setError(null);
    setProcessingStep('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    await clearImageData();
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="image-uploader-redesigned">
      <ErrorMessage message={error} onClose={() => setError(null)} />
      
      {/* Main Upload Area */}
      <div className="upload-container">
        <div 
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <>
              <div className="cloud-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 16.5L12 11.5L17 16.5M12 12V22" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.8828 20C18.2373 19.3313 19.2987 18.1506 19.8294 16.7032C20.3602 15.2558 20.3208 13.6576 19.7193 12.238C19.1177 10.8184 17.9998 9.68553 16.6005 9.07636C15.2012 8.46719 13.6223 8.4253 12.1924 8.95738M7 16.5H6.5C5.17392 16.5 3.90215 15.9732 2.96447 15.0355C2.02678 14.0979 1.5 12.8261 1.5 11.5C1.5 10.1739 2.02678 8.90215 2.96447 7.96447C3.90215 7.02678 5.17392 6.5 6.5 6.5C6.5 5.17392 7.02678 3.90215 7.96447 2.96447C8.90215 2.02678 10.1739 1.5 11.5 1.5C12.8261 1.5 14.0979 2.02678 15.0355 2.96447C15.9732 3.90215 16.5 5.17392 16.5 6.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="upload-text">
                <h3>Drop files here or click to upload</h3>
                <p className="upload-hint">Supported formats: JPG, PNG, GIF, BMP (Max 10MB)</p>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp"
                className="file-input-hidden"
                id="file-input"
              />
              
              <label htmlFor="file-input" className="choose-file-btn">
                <span className="btn-icon">📁</span>
                Choose file
                <span className="dropdown-arrow">▼</span>
              </label>
            </>
          ) : (
            <div className="file-preview-card">
              <div className="file-preview-header">
                <div className="file-info-left">
                  <div className="file-thumbnail">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                  <div className="file-details">
                    <h4>{selectedFile.name}</h4>
                  </div>
                </div>
                <button onClick={handleReset} className="remove-file-btn" title="Remove file">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {selectedFile && (
  <div className="action-buttons-row">
    <button
      onClick={handleViewMetadata}
      disabled={loading}
      className={`action-btn ${processingStep === 'viewing' ? 'active' : ''}`}
    >
      {loading && processingStep === 'viewing' ? (
        <>
          <span className="spinner"></span>
          Analyzing...
        </>
      ) : (
        <div className="btn-content">
          <span className="btn-icon">🔍</span>
          <div className="btn-text">
            <div className="btn-label">View Metadata</div>
            <div className="btn-desc">See what information is embedded in your image</div>
          </div>
        </div>
      )}
    </button>
    
    <button
      onClick={handleStripMetadata}
      disabled={loading}
      className={`action-btn ${processingStep === 'stripping' ? 'active' : ''}`}
    >
      {loading && processingStep === 'stripping' ? (
        <>
          <span className="spinner"></span>
          Analyzing...
        </>
      ) : (
        <div className="btn-content">
          <span className="btn-icon">🧹</span>
          <div className="btn-text">
            <div className="btn-label">Strip & Download</div>
            <div className="btn-desc">Remove all metadata and download clean image</div>
          </div>
        </div>
      )}
    </button>
    
    <button className="add-sample-btn" onClick={handleReset}>
      + ADD ANOTHER FILE
    </button>
  </div>
)}
      </div>
      
      {/* Metadata Viewer */}
      {metadata && <MetadataViewer metadata={metadata} />}
    </div>
  );
};

export default ImageUploader;