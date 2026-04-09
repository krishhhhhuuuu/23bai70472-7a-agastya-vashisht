# AI Monitoring Feature Guide

## Overview
The Cloud Quiz System now includes AI-powered proctoring using TensorFlow.js and the BlazeFace model for real-time face detection during quiz attempts.

## Features

### 1. Real-Time Face Detection
- **Technology**: TensorFlow.js + BlazeFace model
- **Detection Frequency**: Every 3 seconds during quiz
- **Capabilities**:
  - Detects number of faces in frame
  - Tracks face position and movement
  - Identifies suspicious behavior patterns

### 2. Suspicious Activity Detection

#### No Face Detected
- **Trigger**: When no face is visible in the camera
- **Reason**: Student may have left their seat
- **Action**: Logged as suspicious activity

#### Multiple Faces Detected
- **Trigger**: When more than one face is detected
- **Reason**: Unauthorized person helping the student
- **Action**: Immediate alert + logged as suspicious activity

#### Significant Face Movement
- **Trigger**: When face moves more than 150 pixels from previous position
- **Reason**: Student looking away from screen (possibly at notes)
- **Action**: Logged as suspicious activity

### 3. Data Collection

Each suspicious detection records:
- Timestamp of detection
- Number of faces detected
- Specific reasons for flagging
- Video snapshot (optional)

### 4. Teacher Analytics

Teachers can view:
- Total AI detections per attempt
- Detailed timeline of suspicious activities
- Specific reasons for each detection
- Comparison with manual activity flags

## Installation

### Required Packages
```bash
npm install @tensorflow/tfjs @tensorflow-models/blazeface
```

### Fallback Mode
If TensorFlow packages are not installed, the system runs in fallback mode:
- AI monitoring shows as "Loading..."
- Basic monitoring continues (tab switches, copy/paste, etc.)
- No face detection occurs

## How It Works

### Student Side (QuizAttempt.jsx)

1. **Initialization**
   - Camera starts when quiz begins
   - AI model loads in background
   - Face detection begins every 3 seconds

2. **During Quiz**
   - Continuous monitoring
   - Real-time alerts for serious violations
   - All detections logged

3. **Submission**
   - All AI detections included in attempt data
   - Stored in Firebase for teacher review

### Teacher Side (Analytics Pages)

1. **Quiz Analytics**
   - View AI detections per student
   - See timeline of suspicious activities
   - Review specific violation reasons

2. **All Reports**
   - Compare AI detections across students
   - Identify patterns of cheating
   - Filter by quiz or student

## Technical Details

### AI Model
- **Model**: BlazeFace (lightweight face detection)
- **Size**: ~1MB
- **Performance**: Fast, runs in browser
- **Accuracy**: High for frontal faces

### Detection Algorithm
```javascript
1. Capture video frame
2. Run face detection model
3. Analyze results:
   - Count faces
   - Compare with previous position
   - Calculate movement distance
4. If suspicious:
   - Log detection
   - Increment activity count
   - Show alert (if severe)
5. Update monitoring state
```

### Privacy Considerations
- Video processing happens locally in browser
- No video streams sent to server
- Only detection metadata stored
- Snapshots are optional and truncated

## Configuration

### Adjust Detection Sensitivity

In `src/utils/aiMonitoring.js`:

```javascript
// Change movement threshold (default: 150 pixels)
if (distance > 150) {  // Increase for less sensitivity
  result.suspicious = true;
  result.reasons.push('Face moved significantly');
}
```

### Adjust Detection Frequency

In `src/pages/Student/QuizAttempt.jsx`:

```javascript
// Change interval (default: 3000ms = 3 seconds)
monitoringIntervalRef.current = setInterval(async () => {
  await performFaceDetection();
}, 3000);  // Increase for less frequent checks
```

## Troubleshooting

### AI Monitoring Not Starting
1. Check browser console for errors
2. Verify TensorFlow packages are installed
3. Ensure camera permissions are granted
4. Check internet connection (model downloads on first use)

### False Positives
- Adjust movement threshold
- Increase detection interval
- Consider lighting conditions
- Account for natural head movement

### Performance Issues
- Increase detection interval
- Use lower resolution video
- Close other browser tabs
- Check system resources

## Future Enhancements

Potential improvements:
- Eye gaze tracking
- Head pose estimation
- Audio analysis
- Screen recording
- Mobile device detection
- Advanced ML models (emotion detection, attention tracking)

## Best Practices

### For Students
- Ensure good lighting
- Position camera at eye level
- Stay centered in frame
- Avoid excessive movement
- Don't leave during quiz

### For Teachers
- Review AI detections alongside other metrics
- Consider false positives
- Use as one indicator among many
- Communicate monitoring policy clearly
- Respect student privacy

## Legal & Ethical Considerations

- Inform students about AI monitoring
- Obtain consent before quiz
- Comply with privacy regulations (GDPR, FERPA, etc.)
- Provide opt-out alternatives if required
- Secure storage of detection data
- Clear data retention policies

## Support

For issues or questions:
1. Check browser console logs
2. Review detection thresholds
3. Test camera functionality
4. Verify package installation
5. Check Firebase connection
