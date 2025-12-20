import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
        <button className="error-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ErrorMessage;