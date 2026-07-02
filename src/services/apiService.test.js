import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';
import axios from 'axios';

// Mock axios.create before importing apiService.js
const mockPost = mock.fn(async () => ({ data: { success: true } }));
mock.method(axios, 'create', () => {
  return {
    post: mockPost,
    get: mock.fn()
  };
});

// Import dynamically so it receives the mocked axios instance
const { handleError, analyzeImage } = await import('./apiService.js');

test('handleError maps Axios response errors correctly', () => {
  const errorResponse = {
    response: {
      data: {
        detail: 'Inference model timeout'
      }
    }
  };

  assert.throws(
    () => handleError(errorResponse),
    /Inference model timeout/
  );
});

test('handleError fallback to default response error message', () => {
  const errorResponseNoDetail = {
    response: {
      data: {}
    }
  };

  assert.throws(
    () => handleError(errorResponseNoDetail),
    /Server responded with an error during analysis\./
  );
});

test('handleError maps Axios request errors correctly', () => {
  const errorRequest = {
    request: {}
  };

  assert.throws(
    () => handleError(errorRequest),
    /Network error: Could not reach the detection server\. Is it running\?/
  );
});

test('handleError maps generic request failure errors correctly', () => {
  const errorGeneric = {
    message: 'Unknown error occurred'
  };

  assert.throws(
    () => handleError(errorGeneric),
    /Request failed: Unknown error occurred/
  );
});

test('analyzeImage constructs FormData and configures Axios config correctly', async () => {
  // Clear any previous mock calls
  mockPost.mock.resetCalls();

  const mockFile = new Blob(['dummy content'], { type: 'image/png' });
  const mockProgressCallback = mock.fn();

  const result = await analyzeImage(mockFile, mockProgressCallback);

  assert.deepEqual(result, { success: true });
  
  // Verify mockPost was called once
  assert.strictEqual(mockPost.mock.callCount(), 1);
  
  const call = mockPost.mock.calls[0];
  const [url, formData, config] = call.arguments;

  // 1. Verify URL
  assert.strictEqual(url, '/analyze/image');

  // 2. Verify FormData content
  assert.ok(formData instanceof FormData);
  const fileInFormData = formData.get('file');
  assert.ok(fileInFormData instanceof Blob || fileInFormData instanceof File);
  assert.strictEqual(fileInFormData.size, mockFile.size);

  // 3. Verify Config headers
  assert.deepEqual(config.headers, { 'Content-Type': 'multipart/form-data' });

  // 4. Verify Progress handler behavior
  assert.strictEqual(typeof config.onUploadProgress, 'function');
  
  // Simulate progress event
  const progressEvent = { loaded: 65, total: 100 };
  config.onUploadProgress(progressEvent);

  assert.strictEqual(mockProgressCallback.mock.callCount(), 1);
  assert.strictEqual(mockProgressCallback.mock.calls[0].arguments[0], 65); // 65% completed
});
