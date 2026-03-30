import axios from 'axios';

// Create an Axios instance with default configurations
const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Matches FastAPI default dev server port
  timeout: 30000, // 30-second timeout for model inference
});

/**
 * Uploads a media file (image/video) to the deepfake detection backend.
 * 
 * @param {File} file - The file object from the file input.
 * @param {function} onUploadProgress - Optional callback to track upload progress.
 * @returns {Promise<Object>} API Response JSON containing prediction and confidence.
 */
export const detectDeepfake = async (file, onUploadProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      };
    }

    const response = await apiClient.post('/detect', formData, config);
    return response.data;
  } catch (error) {
    // Standardize error return so the UI doesn't crash
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.detail || 'Server responded with an error during analysis.');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error: Could not reach the detection server. Is it running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};
