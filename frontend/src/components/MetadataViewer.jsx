import React, { useState } from 'react';

const MetadataViewer = ({ metadata }) => {
  const [expandedGroups, setExpandedGroups] = useState({
    camera: true,
    location: true,
    dateTime: true,
    image: true,
    other: true
  });
  
  if (!metadata) return null;
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };
  
  const getGroupIcon = (groupKey) => {
    const icons = {
      camera: '📷',
      location: '📍',
      dateTime: '📅',
      image: '🖼️',
      other: '📋'
    };
    return icons[groupKey] || '📋';
  };
  
  const renderMetadataGroup = (group, groupKey) => {
    if (!group || !group.hasData) return null;
    
    return (
      <div key={groupKey} className="metadata-group">
        <div 
          className="metadata-group-header"
          onClick={() => toggleGroup(groupKey)}
        >
          <div className="group-title">
            <span className="group-icon">{getGroupIcon(groupKey)}</span>
            <span className="group-name">{group.groupName}</span>
            <span className="group-count">({Object.keys(group.data).length} items)</span>
          </div>
          <span className="group-toggle">
            {expandedGroups[groupKey] ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedGroups[groupKey] && (
          <div className="metadata-group-content">
            {Object.entries(group.data).map(([key, value]) => (
              <div key={key} className="metadata-row">
                <div className="metadata-key">{key}</div>
                <div className="metadata-value">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="metadata-viewer">
      <h3>Image Metadata</h3>
      
      <div className="metadata-summary">
        <div className="metadata-item">
          <strong>File Name:</strong>
          <span className="info-value file-name">{metadata.fileName}</span>
        </div>
        <div className="metadata-item">
          <strong>File Size:</strong> {formatFileSize(metadata.fileSize)}
        </div>
        <div className="metadata-item">
          <strong>Type:</strong> {metadata.mimeType}
        </div>
        <div className="metadata-item">
          <strong>Has Metadata:</strong>{' '}
          <span className={metadata.hasMetadata ? 'status-yes' : 'status-no'}>
            {metadata.hasMetadata ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      {metadata.hasMetadata && (
        <div className="grouped-metadata">
          <div className="metadata-groups">
            {renderMetadataGroup(metadata.cameraInfo, 'camera')}
            {renderMetadataGroup(metadata.locationInfo, 'location')}
            {renderMetadataGroup(metadata.dateTimeInfo, 'dateTime')}
            {renderMetadataGroup(metadata.imageInfo, 'image')}
            {renderMetadataGroup(metadata.otherInfo, 'other')}
          </div>
        </div>
      )}
      
      {!metadata.hasMetadata && (
        <div className="no-metadata-message">
          <p>✓ This image has no metadata to remove.</p>
        </div>
      )}
    </div>
  );
};

export default MetadataViewer;