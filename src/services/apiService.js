import axios from 'axios';

// Create an Axios instance with default configurations
const apiClient = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : null) || 'https://deep-detect-kiyb.onrender.com', // Points to Render backend with fallback
  timeout: 120000, // 120-second timeout for model inference
});

/**
 * Handle API Errors uniformly
 */
export const handleError = (error) => {
  if (error.response) {
    throw new Error(error.response.data.detail || 'Server responded with an error during analysis.');
  } else if (error.request) {
    throw new Error('Network error: Could not reach the detection server. Is it running?');
  } else {
    throw new Error(`Request failed: ${error.message}`);
  }
};

/**
 * Shared helper to upload media files to specific backend endpoints.
 */
const uploadMedia = async (endpoint, file, onUploadProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      } : undefined
    };
    const response = await apiClient.post(endpoint, formData, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Uploads an image file to the deepfake detection backend.
 */
export const analyzeImage = (file, onUploadProgress = null) =>
  uploadMedia('/analyze/image', file, onUploadProgress);

/**
 * Uploads a video file to the deepfake detection backend.
 */
export const analyzeVideo = (file, onUploadProgress = null) =>
  uploadMedia('/analyze/video', file, onUploadProgress);

/**
 * Uploads an audio file to the deepfake detection backend.
 */
export const analyzeAudio = (file, onUploadProgress = null) =>
  uploadMedia('/analyze/audio', file, onUploadProgress);

/**
 * Submits a URL for website spoofing/cloning analysis.
 */
export const analyzeWebsite = async (url) => {
  try {
    const response = await apiClient.post('/analyze/website', { url });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Sends a background request to wake up the Render server if it's sleeping.
 */
export const pingBackend = async () => {
  try {
    await apiClient.get('/');
    console.log('Backend wake-up ping succeeded.');
  } catch (error) {
    console.warn('Backend wake-up ping failed (might be booting):', error.message);
  }
};
