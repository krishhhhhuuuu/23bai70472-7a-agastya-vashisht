import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import { getQuizById, getQuizQuestions } from "../../services/quizService";
import { loadFaceDetectionModel, detectFaces, analyzeSuspiciousActivity, captureSnapshot } from "../../utils/aiMonitoring";
import Navbar from "../../components/Navbar";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { success, error, warning, info } = useContext(ToastContext);

  const videoRef = useRef(null);

  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [activityCount, setActivityCount] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Report and comment states
  const [reportedQuestions, setReportedQuestions] = useState({});
  const [questionComments, setQuestionComments] = useState({});

  // AI Monitoring states
  const [aiMonitoringActive, setAiMonitoringActive] = useState(false);
  const [aiDetections, setAiDetections] = useState([]);
  const [monitoringState, setMonitoringState] = useState({});
  const monitoringIntervalRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const lastAlertTimeRef = useRef(0);
  const alertCooldown = 10000; // 10 seconds cooldown between alerts
  const [recentDetection, setRecentDetection] = useState(null); // Show recent detection without blocking
  const hasAutoSubmittedRef = useRef(false); // Prevent multiple auto-submits

  /* ================= LOAD QUIZ ================= */
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quiz = await getQuizById(quizId);
        const questionData = await getQuizQuestions(quizId);

        setQuizInfo(quiz);
        setQuestions(questionData);
        setTimeLeft(quiz.duration * 60);
        setLoading(false);
      } catch (error) {
        console.error("Quiz load error:", error);
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!quizInfo) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizInfo]);

  /* ================= CAMERA ================= */
  useEffect(() => {
    // Don't start camera until quiz is loaded
    if (!quizInfo || loading) {
      console.log('Waiting for quiz to load before starting camera');
      return;
    }

    let stream;
    let mounted = true;

    const startCamera = async () => {
      // Wait a bit for the component to fully render
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted) return;

      try {
        console.log('Requesting camera access...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false,
        });

        console.log('Camera access granted, stream:', stream);
        console.log('Stream active:', stream.active);
        console.log('Video tracks:', stream.getVideoTracks());

        // Check if video ref is available
        if (!videoRef.current) {
          console.error('Video ref is null - waiting for render');
          // Wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (videoRef.current && mounted) {
          console.log('Setting srcObject on video element');
          videoRef.current.srcObject = stream;
          
          // Set attributes
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = async () => {
            if (!mounted) return;
            console.log('Video metadata loaded');
            console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            
            try {
              await videoRef.current.play();
              console.log('Video playing successfully');
              console.log('Video readyState:', videoRef.current.readyState);
              setVideoReady(true);
              
              // Load AI model and start monitoring
              await initializeAIMonitoring();
            } catch (playError) {
              console.error('Error playing video:', playError);
            }
          };

          // Also try to play immediately
          try {
            await videoRef.current.play();
            console.log('Video started playing immediately');
            setVideoReady(true);
          } catch (e) {
            console.log('Waiting for metadata before playing');
          }
        } else {
          console.error('Video ref is still null after waiting');
          setCameraError(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        setCameraError(true);
        setActivityCount((prev) => prev + 3);
        
        // Show user-friendly error message
        if (err.name === 'NotAllowedError') {
          error('Camera access denied. Please allow camera access to take the quiz.', 5000);
        } else if (err.name === 'NotFoundError') {
          error('No camera found. Please connect a camera to take the quiz.', 5000);
        } else {
          error('Camera error: ' + err.message, 5000);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      console.log('Cleaning up camera...');
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log('Camera track stopped');
        });
      }
      // Stop AI monitoring
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        console.log('AI monitoring stopped');
      }
    };
  }, [quizInfo, loading]); // Add dependencies

  /* ================= AI MONITORING ================= */
  const initializeAIMonitoring = async () => {
    try {
      console.log('Initializing AI monitoring...');
      await loadFaceDetectionModel();
      setAiMonitoringActive(true);
      
      // Start periodic face detection (every 5 seconds to reduce false positives)
      monitoringIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          await performFaceDetection();
        }
      }, 5000);
      
      console.log('AI monitoring initialized successfully');
    } catch (error) {
      console.error('Error initializing AI monitoring:', error);
      setAiMonitoringActive(false);
    }
  };

  const performFaceDetection = async () => {
    try {
      const faces = await detectFaces(videoRef.current);
      const analysis = analyzeSuspiciousActivity(faces, monitoringState);
      
      if (analysis.suspicious) {
        console.log('Suspicious activity detected:', analysis.reasons);
        
        // Capture snapshot
        const snapshot = captureSnapshot(videoRef.current);
        
        // Record detection
        const detection = {
          timestamp: Date.now(),
          faceCount: analysis.faceCount,
          reasons: analysis.reasons,
          snapshot: snapshot ? snapshot.substring(0, 100) + '...' : null,
        };
        
        setAiDetections(prev => [...prev, detection]);
        setActivityCount(prev => prev + 1);
        setRecentDetection(detection); // Show recent detection
        
        // Clear recent detection after 5 seconds
        setTimeout(() => setRecentDetection(null), 5000);
        
        // Show alert for serious violations (with cooldown)
        const now = Date.now();
        const timeSinceLastAlert = now - lastAlertTimeRef.current;
        
        if (timeSinceLastAlert > alertCooldown) {
          if (analysis.faceCount > 1) {
            warning('⚠️ Multiple people detected! This has been recorded.', 5000);
            lastAlertTimeRef.current = now;
          }
          // Don't alert for no face or movement - just log it
        }
      }
      
      // Update monitoring state (IMPORTANT: pass the entire analysis to preserve lastFacePosition)
      setMonitoringState(analysis);
      
    } catch (error) {
      console.error('Error during face detection:', error);
    }
  };

  /* ================= TAB + COPY DETECTION ================= */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setActivityCount((prev) => prev + 1);
    };

    const handleBlur = () => setActivityCount((prev) => prev + 1);
    const handleCopy = () => setActivityCount((prev) => prev + 1);
    const handleRightClick = (e) => {
      e.preventDefault();
      setActivityCount((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleRightClick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  /* ================= FLAG LOGIC ================= */
  useEffect(() => {
    if (activityCount >= 5) setFlagged(true);

    if (activityCount >= 10 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true; // Prevent multiple submissions
      error("Too many suspicious activities. Auto submitting quiz.", 5000);
      setTimeout(() => handleSubmit(), 1000); // Delay to show toast
    }
  }, [activityCount]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    let score = 0;

    let correctSure = 0;
    let wrongSure = 0;
    let correctGuess = 0;
    let wrongGuess = 0;

    questions.forEach((q) => {
      const selected = Number(answers[q.id]);
      const isCorrect = selected === Number(q.correctIndex);
      const conf = confidence[q.id];

      if (isCorrect) score++;

      if (isCorrect && conf === "Sure") correctSure++;
      if (!isCorrect && conf === "Sure") wrongSure++;
      if (isCorrect && conf === "Guess") correctGuess++;
      if (!isCorrect && conf === "Guess") wrongGuess++;
    });

    // Prepare reported questions data
    const reportedQuestionsData = Object.keys(reportedQuestions)
      .filter(qId => reportedQuestions[qId])
      .map(qId => {
        const question = questions.find(q => q.id === qId);
        return {
          questionId: qId,
          questionText: question?.questionText || "",
          reason: reportedQuestions[qId],
        };
      });

    // Prepare comments data
    const commentsData = Object.keys(questionComments)
      .filter(qId => questionComments[qId]?.trim())
      .map(qId => {
        const question = questions.find(q => q.id === qId);
        return {
          questionId: qId,
          questionText: question?.questionText || "",
          comment: questionComments[qId],
        };
      });

    await addDoc(collection(db, "attempts"), {
      quizId,
      studentId: currentUser.uid,
      score,
      total: questions.length,
      submittedAt: Date.now(),
      suspiciousActivity: flagged,
      activityCount,
      analysis: {
        correctSure,
        wrongSure,
        correctGuess,
        wrongGuess,
      },
      reportedQuestions: reportedQuestionsData,
      comments: commentsData,
      aiDetections: aiDetections, // Include AI monitoring data
      aiMonitoringEnabled: aiMonitoringActive,
    });

    success(`Quiz submitted! Score: ${score}/${questions.length}`, 4000);
    setTimeout(() => navigate("/student"), 1500);
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
  
  if (!quizInfo) return (
    <div className="dashboard-container">
      <div className="empty-state">
        <h3>Quiz not found</h3>
        <p>The quiz you're looking for doesn't exist</p>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="dashboard-container">

        <h2>{quizInfo.title}</h2>

        <div className="quiz-info">
          <div className="info-card">
            <h4>Time Remaining</h4>
            <p>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
          </div>
          
          <div className="info-card">
            <h4>Total Questions</h4>
            <p>{questions.length}</p>
          </div>
          
          <div className="info-card">
            <h4>Topic</h4>
            <p style={{ fontSize: '16px' }}>{quizInfo.topic}</p>
          </div>
        </div>

        <div className="card">
          <h4>Live Monitoring</h4>
          {cameraError && (
            <div className="alert alert-danger">
              ⚠️ Camera access denied. This may be flagged as suspicious activity.
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                Please check:
                <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                  <li>Camera permissions in browser settings</li>
                  <li>Camera is not being used by another application</li>
                  <li>Camera is properly connected</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* AI Monitoring Status */}
          <div style={{ marginBottom: '12px' }}>
            <div className="ai-status">
              {aiMonitoringActive ? (
                <span className="ai-status-active">
                  🤖 AI Monitoring: Active
                </span>
              ) : (
                <span className="ai-status-loading">
                  🤖 AI Monitoring: Loading...
                </span>
              )}
            </div>
            {monitoringState.faceCount !== undefined && (
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Faces detected: {monitoringState.faceCount}
              </div>
            )}
          </div>

          <div className="video-container" style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              webkit-playsinline="true"
              style={{
                width: '280px',
                height: '200px',
                borderRadius: '12px',
                background: '#000',
                objectFit: 'cover',
                display: 'block',
                transform: 'scaleX(-1)' // Mirror the video
              }}
            />
            <div className={`camera-status ${!cameraError && videoReady ? 'active' : ''}`}>
              {cameraError ? '● Camera Off' : videoReady ? '● Recording' : '● Starting...'}
            </div>
          </div>
          
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            {videoReady && videoRef.current?.videoWidth && videoRef.current?.videoHeight ? (
              <span>✓ Video active: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</span>
            ) : (
              <span>⏳ Waiting for video stream...</span>
            )}
          </div>
        </div>

        {activityCount > 0 && (
          <div className="alert alert-warning">
            ⚠️ Suspicious Activity Detected: {activityCount} {activityCount === 1 ? 'incident' : 'incidents'}
            {activityCount >= 5 && ' - Your quiz has been flagged!'}
            {activityCount >= 8 && ' - Auto-submit at 10 incidents!'}
          </div>
        )}

        {/* Recent AI Detection */}
        {recentDetection && (
          <div className="alert alert-info" style={{ animation: 'slideIn 0.3s ease' }}>
            🤖 AI Detection: {recentDetection.reasons.join(', ')}
          </div>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <span className="question-number">Question {index + 1}</span>
            <h4 className="question-text">{q.questionText}</h4>

            <div className="options-list">
              {q.options.map((opt, i) => (
                <div 
                  key={i} 
                  className={`option-item ${answers[q.id] === i ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, [q.id]: i })}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={i}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  />
                  <label>{opt}</label>
                </div>
              ))}
            </div>

            <div className="confidence">
              <label>
                <strong>Confidence Level:</strong>
                <select
                  value={confidence[q.id] || ''}
                  onChange={(e) =>
                    setConfidence({
                      ...confidence,
                      [q.id]: e.target.value,
                    })
                  }
                >
                  <option value="">Select confidence</option>
                  <option value="Sure">Sure</option>
                  <option value="Guess">Guess</option>
                </select>
              </label>
            </div>

            {/* Report Question Section */}
            <div className="question-feedback-section">
              <div className="report-section">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <strong>🚩 Report Issue:</strong>
                </label>
                <select
                  value={reportedQuestions[q.id] || ''}
                  onChange={(e) =>
                    setReportedQuestions({
                      ...reportedQuestions,
                      [q.id]: e.target.value,
                    })
                  }
                  style={{ width: '100%' }}
                >
                  <option value="">No issue</option>
                  <option value="Incorrect question">Incorrect question</option>
                  <option value="Wrong answer marked">Wrong answer marked as correct</option>
                  <option value="Unclear wording">Unclear wording</option>
                  <option value="Multiple correct answers">Multiple correct answers possible</option>
                  <option value="Typo or grammar error">Typo or grammar error</option>
                  <option value="Other">Other issue</option>
                </select>
              </div>

              {/* Comment Section */}
              <div className="comment-section">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <strong>💬 Add Comment (Optional):</strong>
                </label>
                <textarea
                  placeholder="Share your thoughts about this question..."
                  value={questionComments[q.id] || ''}
                  onChange={(e) =>
                    setQuestionComments({
                      ...questionComments,
                      [q.id]: e.target.value,
                    })
                  }
                  rows="2"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <button onClick={handleSubmit} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
          Submit Quiz
        </button>
      </div>
    </>
  );
}