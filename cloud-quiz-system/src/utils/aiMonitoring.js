// AI Monitoring utility — BlazeFace face detection
// COCO-SSD was removed due to Vite bundling incompatibilities

let model = null;
let isModelLoading = false;
let tfAvailable = false;

const checkTensorFlowAvailability = async () => {
  try {
    await import(/* @vite-ignore */ '@tensorflow-models/blazeface');
    await import(/* @vite-ignore */ '@tensorflow/tfjs');
    tfAvailable = true;
    return true;
  } catch (error) {
    console.warn('TensorFlow not available. AI monitoring will use fallback mode.');
    tfAvailable = false;
    return false;
  }
};

export const loadFaceDetectionModel = async () => {
  if (model) return model;
  if (isModelLoading) {
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

    const blazeface = await import(/* @vite-ignore */ '@tensorflow-models/blazeface');
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

export const detectFaces = async (videoElement) => {
  if (!tfAvailable) {
    // Fallback: simulate single face detected so no false flags
    return [{
      topLeft: [100, 100],
      bottomRight: [300, 300],
      probability: [0.9],
    }];
  }

  if (!model) {
    model = await loadFaceDetectionModel();
  }

  if (!model || !videoElement) return [];

  try {
    const predictions = await model.estimateFaces(videoElement, false);
    console.log('Face detection results:', predictions.length, 'faces detected');
    return predictions;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};

export const analyzeSuspiciousActivity = (faces, previousState = {}) => {
  const result = {
    faceCount: faces.length,
    suspicious: false,
    reasons: [],
    timestamp: Date.now(),
  };

  if (faces.length === 0) {
    result.suspicious = true;
    result.reasons.push('No face detected');
  }

  if (faces.length > 1) {
    result.suspicious = true;
    result.reasons.push(`Multiple faces detected (${faces.length})`);
  }

  if (faces.length === 1 && previousState.lastFacePosition) {
    const currentFace = faces[0];
    const prevFace = previousState.lastFacePosition;

    const currentCenter = {
      x: (currentFace.topLeft[0] + currentFace.bottomRight[0]) / 2,
      y: (currentFace.topLeft[1] + currentFace.bottomRight[1]) / 2,
    };
    const prevCenter = {
      x: (prevFace.topLeft[0] + prevFace.bottomRight[0]) / 2,
      y: (prevFace.topLeft[1] + prevFace.bottomRight[1]) / 2,
    };

    const distance = Math.sqrt(
      Math.pow(currentCenter.x - prevCenter.x, 2) +
      Math.pow(currentCenter.y - prevCenter.y, 2)
    );

    if (distance > 150) {
      result.suspicious = true;
      result.reasons.push(`Face moved significantly (${distance.toFixed(0)} pixels)`);
    }
  }

  if (faces.length === 1) {
    result.lastFacePosition = faces[0];
  }

  return result;
};

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
