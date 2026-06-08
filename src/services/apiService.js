import axios from 'axios';

// Create an Axios instance with default configurations
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://deep-detect-kiyb.onrender.com', // Points to Render backend with fallback
  timeout: 120000, // 120-second timeout for model inference
});

/**
 * Handle API Errors uniformly
 */
const handleError = (error) => {
  if (error.response) {
    throw new Error(error.response.data.detail || 'Server responded with an error during analysis.');
  } else if (error.request) {
    throw new Error('Network error: Could not reach the detection server. Is it running?');
  } else {
    throw new Error(`Request failed: ${error.message}`);
  }
};

/**
 * Uploads an image file to the deepfake detection backend.
 */
export const analyzeImage = async (file, onUploadProgress = null) => {
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
    const response = await apiClient.post('/analyze/image', formData, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Uploads a video file to the deepfake detection backend.
 */
export const analyzeVideo = async (file, onUploadProgress = null) => {
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
    const response = await apiClient.post('/analyze/video', formData, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Uploads an audio file to the deepfake detection backend.
 */
export const analyzeAudio = async (file, onUploadProgress = null) => {
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
    const response = await apiClient.post('/analyze/audio', formData, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

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
