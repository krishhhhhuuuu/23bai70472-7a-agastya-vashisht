# Camera Troubleshooting Guide

## Common Issues and Solutions

### 1. Video Not Showing (Black Screen)

**Possible Causes:**
- Camera permissions not granted
- Camera being used by another application
- Browser doesn't support getUserMedia API
- HTTPS required (camera only works on secure connections)

**Solutions:**

#### Check Browser Permissions
1. Click the lock icon in the address bar
2. Ensure camera is set to "Allow"
3. Refresh the page

#### Check Camera Availability
Open browser console (F12) and run:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log('Available cameras:', cameras);
  });
```

#### Test Camera Directly
Open browser console and run:
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Camera works!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('Camera error:', err.name, err.message);
  });
```

### 2. Camera Permission Errors

**NotAllowedError:**
- User denied camera access
- Camera blocked in browser settings
- Solution: Grant permissions and reload

**NotFoundError:**
- No camera detected
- Camera disconnected
- Solution: Connect camera and reload

**NotReadableError:**
- Camera in use by another app
- Hardware error
- Solution: Close other apps using camera

### 3. Video Element Not Displaying

**Check Console Logs:**
The app now logs detailed camera information:
- "Requesting camera access..."
- "Camera access granted"
- "Video metadata loaded"
- "Video playing successfully"

If you don't see these logs, check:
1. Browser console for errors
2. Network tab for blocked requests
3. Browser compatibility

### 4. Browser Compatibility

**Supported Browsers:**
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

**Not Supported:**
- Internet Explorer
- Older mobile browsers

### 5. HTTPS Requirement

Camera access requires HTTPS except for:
- localhost
- 127.0.0.1

**For Production:**
- Ensure site uses HTTPS
- Valid SSL certificate required

### 6. Mobile Devices

**iOS Safari:**
- Requires iOS 11+
- May need user interaction to start
- Check Settings > Safari > Camera

**Android Chrome:**
- Usually works well
- Check app permissions
- Ensure Chrome is updated

## Testing Steps

### Step 1: Check Browser Console
1. Open quiz page
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for camera-related logs
5. Check for any red error messages

### Step 2: Check Video Element
1. Open DevTools
2. Go to Elements/Inspector tab
3. Find the `<video>` element
4. Check if it has:
   - `srcObject` property set
   - Width and height
   - Video stream active

### Step 3: Check Network
1. Open DevTools Network tab
2. Reload page
3. Check if TensorFlow models load
4. Look for any failed requests

### Step 4: Test Permissions
1. Go to browser settings
2. Find site permissions
3. Ensure camera is allowed
4. Clear and re-grant if needed

## Debug Information

The quiz page now shows:
- Camera status (Recording/Off)
- AI monitoring status (Active/Loading)
- Video resolution when available
- Face count when detected
- Detailed error messages

## Advanced Debugging

### Enable Verbose Logging
Open console and run:
```javascript
// Enable all logs
localStorage.setItem('debug', 'camera:*');
```

### Check Video Stream
```javascript
// Get video element
const video = document.querySelector('video');
console.log('Video element:', video);
console.log('Video srcObject:', video.srcObject);
console.log('Video readyState:', video.readyState);
console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
```

### Check MediaStream
```javascript
// Check if stream is active
const stream = video.srcObject;
if (stream) {
  console.log('Stream active:', stream.active);
  console.log('Video tracks:', stream.getVideoTracks());
  stream.getVideoTracks().forEach(track => {
    console.log('Track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted);
  });
}
```

## Still Not Working?

1. **Try a different browser** - Test in Chrome, Firefox, or Edge
2. **Restart browser** - Close all windows and reopen
3. **Check system camera** - Test camera in other apps
4. **Update browser** - Ensure latest version
5. **Check antivirus** - May block camera access
6. **Try incognito mode** - Rules out extension conflicts

## Contact Support

If camera still doesn't work, provide:
- Browser name and version
- Operating system
- Console error messages
- Screenshot of the issue
- Steps you've already tried
