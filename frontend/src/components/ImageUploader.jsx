import React, { useState, useRef, useEffect } from 'react';
import { extractMetadata, stripMetadata } from '../services/apiService';
import MetadataViewer from './MetadataViewer';
import ErrorMessage from './ErrorMessage';
import CloudStoragePicker from './CloudStoragePicker';
import { 
  saveImageData, 
  loadImageData, 
  clearImageData, 
  fileToStorable, 
  storableToFile 
} from '../utils/storageUtils';
import { metadataRateLimiter, stripRateLimiter, checkRateLimit } from '../utils/rateLimitUtils';
import { FcFolder } from "react-icons/fc";
import { MdImageSearch } from "react-icons/md";
import { BiSolidEraser } from "react-icons/bi";



const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingStep, setProcessingStep] = useState('idle'); // idle, viewing, stripping
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: 10, retryAfter: 0 });
  const fileInputRef = useRef(null);
  
    // Update rate limit info every second
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = metadataRateLimiter.getRemainingRequests();
      const retryAfter = metadataRateLimiter.getRetryAfter();
      setRateLimitInfo({ remaining, retryAfter });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

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

    // Check rate limit
    try {
      checkRateLimit(metadataRateLimiter, 'metadata view');
    } catch (err) {
      setError(err.message);
      return;
    }
    
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
      if (err.message.includes('Too many requests') || err.message.includes('429')) {
        setError('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        setError(err.message);
      }
      setProcessingStep('idle');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStripMetadata = async () => {
    if (!selectedFile) return;

        // Check rate limit (stricter for strip operations)
    try {
      checkRateLimit(stripRateLimiter, 'strip');
    } catch (err) {
      setError(err.message);
      return;
    }
    
    
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
      // Check if it's a 429 (rate limit) error
      if (err.message.includes('Too many requests') || err.message.includes('429')) {
        setError('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        setError(err.message);
      }
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

      {rateLimitInfo.remaining <= 0 && rateLimitInfo.retryAfter > 0 && (
        <div className="rate-limit-blocked">
          🚫 Rate limit reached. Please wait {rateLimitInfo.retryAfter} seconds
        </div>
      )}
      
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
                  <FcFolder className="folder-emoji" size="2.2em" />
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
                Choose file
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
          
          <CloudStoragePicker 
            onFileSelect={handleFileUpload} 
            onError={setError}
          />
        </div>
        
        {/* Action Buttons */}
        {selectedFile && (
  <div className="action-buttons-row">
    <button
      onClick={handleViewMetadata}
      disabled={loading || rateLimitInfo.remaining <= 0}
      className={`action-btn ${processingStep === 'viewing' ? 'active' : ''}`}
    >
      {loading && processingStep === 'viewing' ? (
        <>
          <span className="spinner"></span>
          Analyzing...
        </>
      ) : (
        <div className="btn-content">
          <MdImageSearch className="btn-icon" size="1.5em" />
          <div className="btn-text">
            <div className="btn-label">View Metadata</div>
            <div className="btn-desc">See what information is embedded in your image</div>
          </div>
        </div>
      )}
    </button>
    
    <button
      onClick={handleStripMetadata}
      disabled={loading || rateLimitInfo.remaining <= 0}
      className={`action-btn ${processingStep === 'stripping' ? 'active' : ''}`}
    >
      {loading && processingStep === 'stripping' ? (
        <>
          <span className="spinner"></span>
          Analyzing...
        </>
      ) : (
        <div className="btn-content">
          <BiSolidEraser className="btn-icon" size="1.5em" />
          <div className="btn-text">
            <div className="btn-label">Strip & Download</div>
            <div className="btn-desc">Remove all metadata and download clean image</div>
          </div>
        </div>
      )}
    </button>
    
    <button className="add-sample-btn" onClick={handleReset}>
       <span className="rotate-icon">↻</span> CHOOSE ANOTHER
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