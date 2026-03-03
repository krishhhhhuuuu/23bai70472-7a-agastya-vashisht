import { useEffect, useState, useContext } from "react";
import { getAllQuizzes, getQuizAttempts } from "../../services/quizService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import StudyGroups from "./StudyGroups";
import AskTeacher from "./AskTeacher";
import Goals from "./Goals";

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState('quizzes'); // quizzes, analytics, groups, messages
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const quizzesData = await getAllQuizzes();
    setQuizzes(quizzesData);

    // Load student's attempts
    const allAttempts = await getQuizAttempts();
    const studentAttempts = allAttempts.filter(a => a.studentId === currentUser.uid);
    setMyAttempts(studentAttempts);
  };

  const calculateStats = () => {
    if (myAttempts.length === 0) return null;

    const totalQuizzes = myAttempts.length;
    const avgScore = myAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / totalQuizzes;
    const bestScore = Math.max(...myAttempts.map(a => (a.score / a.total) * 100));
    const passedQuizzes = myAttempts.filter(a => (a.score / a.total) * 100 >= 50).length;

    return {
      totalQuizzes,
      avgScore: avgScore.toFixed(1),
      bestScore: bestScore.toFixed(1),
      passedQuizzes,
      passRate: ((passedQuizzes / totalQuizzes) * 100).toFixed(1)
    };
  };

  const stats = calculateStats();

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Student Dashboard</h2>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            📝 Quizzes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            🎯 Goals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            👥 Study Groups
          </button>
          <button 
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            💬 Ask Teacher
          </button>
        </div>

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="tab-content">
            <h3>Available Quizzes</h3>
            {quizzes.length === 0 ? (
              <div className="empty-state">
                <h3>No quizzes available</h3>
                <p>Check back later for new quizzes</p>
              </div>
            ) : (
              <div className="quiz-grid">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="quiz-card" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                    <h3>{quiz.title}</h3>
                    <div className="quiz-meta">
                      <div className="quiz-meta-item">
                        📚 Topic: {quiz.topic}
                      </div>
                      <div className="quiz-meta-item">
                        ⏱️ Duration: {quiz.duration} minutes
                      </div>
                    </div>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quiz/${quiz.id}`);
                    }}>
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h3>My Performance Analytics</h3>
            
            {stats ? (
              <>
                {/* Stats Overview */}
                <div className="quiz-info">
                  <div className="info-card">
                    <h4>Quizzes Taken</h4>
                    <p>{stats.totalQuizzes}</p>
                  </div>
                  <div className="info-card">
                    <h4>Average Score</h4>
                    <p>{stats.avgScore}%</p>
                  </div>
                  <div className="info-card">
                    <h4>Best Score</h4>
                    <p>{stats.bestScore}%</p>
                  </div>
                  <div className="info-card">
                    <h4>Pass Rate</h4>
                    <p>{stats.passRate}%</p>
                  </div>
                  <div className="info-card">
                    <h4>Passed Quizzes</h4>
                    <p>{stats.passedQuizzes}/{stats.totalQuizzes}</p>
                  </div>
                </div>

                {/* Recent Attempts */}
                <div className="card">
                  <h3>Recent Quiz Attempts</h3>
                  <div className="attempts-table">
                    {myAttempts
                      .sort((a, b) => b.submittedAt - a.submittedAt)
                      .slice(0, 5)
                      .map((attempt) => {
                        const percentage = ((attempt.score / attempt.total) * 100).toFixed(1);
                        const isPassed = percentage >= 50;
                        
                        return (
                          <div key={attempt.id} className="attempt-card">
                            <div className="attempt-header">
                              <div>
                                <h4>Quiz Attempt</h4>
                                <p className="attempt-date">
                                  {new Date(attempt.submittedAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="attempt-score">
                                <span className={`score-badge ${isPassed ? 'passed' : 'failed'}`}>
                                  {attempt.score}/{attempt.total} ({percentage}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>No quiz attempts yet</h3>
                <p>Take a quiz to see your analytics</p>
              </div>
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="tab-content">
            <Goals stats={stats} myAttempts={myAttempts} />
          </div>
        )}

        {/* Study Groups Tab */}
        {activeTab === 'groups' && (
          <div className="tab-content">
            <h3>Study Groups</h3>
            <StudyGroups />
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="tab-content">
            <h3>Ask Your Teacher</h3>
            <AskTeacher />
          </div>
        )}
      </div>
    </>
  );
}