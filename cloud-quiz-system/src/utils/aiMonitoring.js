// AI Monitoring utility with fallback for when TensorFlow is not available

let model = null;
let isModelLoading = false;
let tfAvailable = false;

// Check if TensorFlow is available
const checkTensorFlowAvailability = async () => {
  try {
    const blazeface = await import('@tensorflow-models/blazeface');
    await import('@tensorflow/tfjs');
    tfAvailable = true;
    return true;
  } catch (error) {
    console.warn('TensorFlow not available. AI monitoring will use fallback mode.');
    tfAvailable = false;
    return false;
  }
};

/**
 * Load the BlazeFace model for face detection
 */
export const loadFaceDetectionModel = async () => {
  if (model) return model;
  if (isModelLoading) {
    // Wait for the model to finish loading
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return model;
  }

  try {
    const available = await checkTensorFlowAvailability();
    if (!available) {
      console.log('Running in fallback mode without AI detection');
      return null;
    }

    isModelLoading = true;
    console.log('Loading face detection model...');
    
    const blazeface = await import('@tensorflow-models/blazeface');
    model = await blazeface.load();
    
    console.log('Face detection model loaded successfully');
    isModelLoading = false;
    return model;
  } catch (error) {
    console.error('Error loading face detection model:', error);
    isModelLoading = false;
    return null;
  }
};

/**
 * Detect faces in a video element
 * @param {HTMLVideoElement} videoElement 
 * @returns {Promise<Array>} Array of detected faces
 */
export const detectFaces = async (videoElement) => {
  if (!tfAvailable) {
    // Fallback: simulate detection with random position for testing
    const randomX = 100 + Math.random() * 200;
    const randomY = 100 + Math.random() * 100;
    return [{
      topLeft: [randomX, randomY],
      bottomRight: [randomX + 200, randomY + 200],
      probability: [0.9]
    }];
  }

  if (!model) {
    model = await loadFaceDetectionModel();
  }

  if (!model || !videoElement) return [];

  try {
    const predictions = await model.estimateFaces(videoElement, false);
    console.log('Face detection results:', predictions.length, 'faces detected');
    if (predictions.length > 0) {
      console.log('Face positions:', predictions.map(p => ({
        topLeft: p.topLeft,
        bottomRight: p.bottomRight
      })));
    }
    return predictions;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};

/**
 * Analyze suspicious behavior based on face detection
 * @param {Array} faces - Array of detected faces
 * @param {Object} previousState - Previous monitoring state
 * @returns {Object} Analysis result with suspicious activities
 */
export const analyzeSuspiciousActivity = (faces, previousState = {}) => {
  const result = {
    faceCount: faces.length,
    suspicious: false,
    reasons: [],
    timestamp: Date.now(),
  };

  // No face detected
  if (faces.length === 0) {
    result.suspicious = true;
    result.reasons.push('No face detected');
    console.log('⚠️ No face detected');
  }

  // Multiple faces detected
  if (faces.length > 1) {
    result.suspicious = true;
    result.reasons.push(`Multiple faces detected (${faces.length})`);
    console.log(`⚠️ Multiple faces detected: ${faces.length}`);
  }

  // Face moved significantly (looking away)
  if (faces.length === 1 && previousState.lastFacePosition) {
    const currentFace = faces[0];
    const prevFace = previousState.lastFacePosition;
    
    // Calculate center of face
    const currentCenter = {
      x: (currentFace.topLeft[0] + currentFace.bottomRight[0]) / 2,
      y: (currentFace.topLeft[1] + currentFace.bottomRight[1]) / 2,
    };
    
    const prevCenter = {
      x: (prevFace.topLeft[0] + prevFace.bottomRight[0]) / 2,
      y: (prevFace.topLeft[1] + prevFace.bottomRight[1]) / 2,
    };

    // Calculate movement distance
    const distance = Math.sqrt(
      Math.pow(currentCenter.x - prevCenter.x, 2) + 
      Math.pow(currentCenter.y - prevCenter.y, 2)
    );

    console.log(`Face movement: ${distance.toFixed(2)} pixels`);

    // If face moved more than 150 pixels, it might be looking away (increased threshold)
    if (distance > 150) {
      result.suspicious = true;
      result.reasons.push(`Face moved significantly (${distance.toFixed(0)} pixels)`);
      console.log(`⚠️ Significant face movement detected: ${distance.toFixed(0)} pixels`);
    }
  }

  // Store current face position for next comparison
  if (faces.length === 1) {
    result.lastFacePosition = faces[0];
  }

  return result;
};

/**
 * Capture a snapshot from video element
 * @param {HTMLVideoElement} videoElement 
 * @returns {string} Base64 encoded image
 */
export const captureSnapshot = (videoElement) => {
  if (!videoElement) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Error capturing snapshot:', error);
    return null;
  }
};
