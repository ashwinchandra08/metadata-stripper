import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/images';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Extract metadata from an image
 * @param {File} file - The image file to analyze
 * @returns {Promise} - Promise with metadata information
 */
export const extractMetadata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post('/metadata', formData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to extract metadata'
    );
  }
};

/**
 * Strip metadata from an image and download the cleaned version
 * @param {File} file - The image file to clean
 * @returns {Promise} - Promise with cleaned image blob
 */
export const stripMetadata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post('/strip', formData, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to strip metadata'
    );
  }
};

/**
 * Check API health
 * @returns {Promise} - Promise with health status
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch {
    throw new Error('API is not available');
  }
};