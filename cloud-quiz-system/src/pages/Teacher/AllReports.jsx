import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAttemptsByTeacher, getAllQuizzes } from "../../services/quizService";
import { getUserById } from "../../services/userService";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import Navbar from "../../components/Navbar";

export default function AllReports() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { error } = useContext(ToastContext);

  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState("all");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      console.log("Loading reports for teacher:", currentUser.uid);
      const attemptsData = await getAttemptsByTeacher(currentUser.uid);
      console.log("Attempts data:", attemptsData);
      
      const quizzesData = await getAllQuizzes();
      const teacherQuizzes = quizzesData.filter(q => q.createdBy === currentUser.uid);
      console.log("Teacher quizzes:", teacherQuizzes);

      const attemptsWithDetails = await Promise.all(
        attemptsData.map(async (attempt) => {
          const user = await getUserById(attempt.studentId);
          const quiz = quizzesData.find(q => q.id === attempt.quizId);
          return {
            ...attempt,
            studentEmail: user?.email || "Unknown",
            quizTitle: quiz?.title || "Unknown Quiz",
          };
        })
      );

      console.log("Attempts with details:", attemptsWithDetails);
      setAttempts(attemptsWithDetails);
      setQuizzes(teacherQuizzes);
      setLoading(false);
    } catch (err) {
      console.error("Error loading reports:", err);
      error("Error loading reports: " + err.message, 4000);
      setLoading(false);
    }
  };

  const filteredAttempts = selectedQuiz === "all" 
    ? attempts 
    : attempts.filter(a => a.quizId === selectedQuiz);

  const calculateOverallStats = () => {
    if (filteredAttempts.length === 0) return null;

    const scores = filteredAttempts.map(a => (a.score / a.total) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const flaggedCount = filteredAttempts.filter(a => a.suspiciousActivity).length;
    const uniqueStudents = new Set(filteredAttempts.map(a => a.studentId)).size;

    return {
      totalAttempts: filteredAttempts.length,
      avgScore: avgScore.toFixed(1),
      flaggedCount,
      uniqueStudents,
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

  const stats = calculateOverallStats();

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
          <h2>Student Reports</h2>
          <button onClick={() => navigate("/teacher")}>← Back to Dashboard</button>
        </div>

        {/* Filter */}
        <div className="card">
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong>Filter by Quiz:</strong>
            <select 
              value={selectedQuiz} 
              onChange={(e) => setSelectedQuiz(e.target.value)}
              style={{ maxWidth: '400px' }}
            >
              <option value="all">All Quizzes</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </label>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="empty-state">
            <h3>No attempts found</h3>
            <p>No students have taken your quizzes yet</p>
          </div>
        ) : (
          <>
            {/* Overall Statistics */}
            <div className="quiz-info">
              <div className="info-card">
                <h4>Total Attempts</h4>
                <p>{stats.totalAttempts}</p>
              </div>
              <div className="info-card">
                <h4>Unique Students</h4>
                <p>{stats.uniqueStudents}</p>
              </div>
              <div className="info-card">
                <h4>Average Score</h4>
                <p>{stats.avgScore}%</p>
              </div>
              <div className="info-card" style={{ background: stats.flaggedCount > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <h4>Flagged Attempts</h4>
                <p>{stats.flaggedCount}</p>
              </div>
            </div>

            {/* Attempts List */}
            <div className="card">
              <h3>All Attempts</h3>
              <div className="attempts-table">
                {filteredAttempts
                  .sort((a, b) => b.submittedAt - a.submittedAt)
                  .map((attempt) => {
                    const percentage = ((attempt.score / attempt.total) * 100).toFixed(1);
                    const isPassed = percentage >= 50;

                    return (
                      <div key={attempt.id} className="attempt-card">
                        <div className="attempt-header">
                          <div>
                            <h4>{attempt.studentEmail}</h4>
                            <p style={{ fontSize: '14px', color: '#667eea', margin: '4px 0' }}>
                              {attempt.quizTitle}
                            </p>
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
