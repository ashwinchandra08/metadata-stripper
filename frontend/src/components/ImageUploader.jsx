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
                <span className="folder-emoji">📁</span>
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