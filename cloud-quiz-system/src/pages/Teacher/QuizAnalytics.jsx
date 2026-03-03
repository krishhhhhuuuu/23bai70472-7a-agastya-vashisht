import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById, getQuizAttempts } from "../../services/quizService";
import { getUserById } from "../../services/userService";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import Navbar from "../../components/Navbar";

export default function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { error } = useContext(ToastContext);

  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [quizId]);

  const loadAnalytics = async () => {
    try {
      console.log("Loading analytics for quiz:", quizId);
      const quizData = await getQuizById(quizId);
      console.log("Quiz data:", quizData);
      
      if (!quizData || quizData.createdBy !== currentUser.uid) {
        error("Unauthorized access", 3000);
        navigate("/teacher");
        return;
      }

      const attemptsData = await getQuizAttempts(quizId);
      console.log("Attempts data:", attemptsData);
      
      const attemptsWithUsers = await Promise.all(
        attemptsData.map(async (attempt) => {
          const user = await getUserById(attempt.studentId);
          return {
            ...attempt,
            studentEmail: user?.email || "Unknown",
          };
        })
      );

      console.log("Attempts with users:", attemptsWithUsers);
      setQuiz(quizData);
      setAttempts(attemptsWithUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error loading analytics:", err);
      error("Error loading analytics: " + err.message, 4000);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (attempts.length === 0) return null;

    const scores = attempts.map(a => (a.score / a.total) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = (attempts.filter(a => (a.score / a.total) * 100 >= 50).length / attempts.length) * 100;
    const flaggedCount = attempts.filter(a => a.suspiciousActivity).length;

    return {
      avgScore: avgScore.toFixed(1),
      highestScore: highestScore.toFixed(1),
      lowestScore: lowestScore.toFixed(1),
      passRate: passRate.toFixed(1),
      flaggedCount,
      totalAttempts: attempts.length,
    };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2>Quiz Analytics: {quiz?.title}</h2>
          <button onClick={() => navigate("/teacher")}>← Back to Dashboard</button>
        </div>

        {attempts.length === 0 ? (
          <div className="empty-state">
            <h3>No attempts yet</h3>
            <p>Students haven't taken this quiz yet</p>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            <div className="quiz-info">
              <div className="info-card">
                <h4>Total Attempts</h4>
                <p>{stats.totalAttempts}</p>
              </div>
              <div className="info-card">
                <h4>Average Score</h4>
                <p>{stats.avgScore}%</p>
              </div>
              <div className="info-card">
                <h4>Pass Rate</h4>
                <p>{stats.passRate}%</p>
              </div>
              <div className="info-card">
                <h4>Highest Score</h4>
                <p>{stats.highestScore}%</p>
              </div>
              <div className="info-card">
                <h4>Lowest Score</h4>
                <p>{stats.lowestScore}%</p>
              </div>
              <div className="info-card" style={{ background: stats.flaggedCount > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <h4>Flagged Attempts</h4>
                <p>{stats.flaggedCount}</p>
              </div>
            </div>

            {/* Individual Attempts */}
            <div className="card">
              <h3>Student Attempts</h3>
              <div className="attempts-table">
                {attempts.map((attempt) => {
                  const percentage = ((attempt.score / attempt.total) * 100).toFixed(1);
                  const isPassed = percentage >= 50;

                  return (
                    <div key={attempt.id} className="attempt-card">
                      <div className="attempt-header">
                        <div>
                          <h4>{attempt.studentEmail}</h4>
                          <p className="attempt-date">{formatDate(attempt.submittedAt)}</p>
                        </div>
                        <div className="attempt-score">
                          <span className={`score-badge ${isPassed ? 'passed' : 'failed'}`}>
                            {attempt.score}/{attempt.total} ({percentage}%)
                          </span>
                        </div>
                      </div>

                      <div className="attempt-details">
                        <div className="detail-item">
                          <span className="detail-label">Confidence Analysis:</span>
                          <div className="confidence-grid">
                            <div className="confidence-item">
                              <span>✓ Sure & Correct:</span>
                              <strong>{attempt.analysis?.correctSure || 0}</strong>
                            </div>
                            <div className="confidence-item">
                              <span>✗ Sure & Wrong:</span>
                              <strong>{attempt.analysis?.wrongSure || 0}</strong>
                            </div>
                            <div className="confidence-item">
                              <span>✓ Guess & Correct:</span>
                              <strong>{attempt.analysis?.correctGuess || 0}</strong>
                            </div>
                            <div className="confidence-item">
                              <span>✗ Guess & Wrong:</span>
                              <strong>{attempt.analysis?.wrongGuess || 0}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Reported Questions */}
                        {attempt.reportedQuestions && attempt.reportedQuestions.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">🚩 Reported Questions:</span>
                            <div className="reported-questions-list">
                              {attempt.reportedQuestions.map((report, idx) => (
                                <div key={idx} className="reported-question-item">
                                  <div className="reported-question-header">
                                    <strong>{report.questionText}</strong>
                                  </div>
                                  <div className="reported-reason">
                                    <span className="reason-badge">{report.reason}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        {attempt.comments && attempt.comments.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">💬 Student Comments:</span>
                            <div className="comments-list">
                              {attempt.comments.map((comment, idx) => (
                                <div key={idx} className="comment-item">
                                  <div className="comment-question">
                                    <strong>Q:</strong> {comment.questionText}
                                  </div>
                                  <div className="comment-text">
                                    {comment.comment}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Detections */}
                        {attempt.aiDetections && attempt.aiDetections.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">🤖 AI Monitoring Detections:</span>
                            <div className="ai-detections-list">
                              {attempt.aiDetections.map((detection, idx) => (
                                <div key={idx} className="ai-detection-item">
                                  <div className="ai-detection-time">
                                    {new Date(detection.timestamp).toLocaleTimeString()}
                                  </div>
                                  <div className="ai-detection-reasons">
                                    {detection.reasons.map((reason, rIdx) => (
                                      <div key={rIdx} className="ai-detection-reason">
                                        {reason}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                              Total AI detections: {attempt.aiDetections.length}
                            </div>
                          </div>
                        )}

                        {attempt.suspiciousActivity && (
                          <div className="alert alert-danger" style={{ marginTop: '12px' }}>
                            ⚠️ Suspicious Activity Detected ({attempt.activityCount} incidents)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
