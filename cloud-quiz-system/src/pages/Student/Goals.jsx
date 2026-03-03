import { useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";

export default function Goals({ stats, myAttempts }) {
  const { currentUser } = useContext(AuthContext);
  const { success, error } = useContext(ToastContext);
  const [goals, setGoals] = useState({
    targetScore: 80,
    weeklyQuizzes: 3,
    perfectScores: 5,
    streak: 7
  });
  const [showSetGoals, setShowSetGoals] = useState(false);
  const [editGoals, setEditGoals] = useState(goals);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const goalsDoc = await getDoc(doc(db, "studentGoals", currentUser.uid));
      if (goalsDoc.exists()) {
        setGoals(goalsDoc.data());
        setEditGoals(goalsDoc.data());
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const saveGoals = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "studentGoals", currentUser.uid), editGoals);
      setGoals(editGoals);
      setShowSetGoals(false);
      success("Goals updated successfully!", 3000);
    } catch (err) {
      console.error("Error saving goals:", err);
      error("Error saving goals", 3000);
    }
  };

  const calculateProgress = () => {
    if (!stats) return {};

    const avgScoreProgress = Math.min((parseFloat(stats.avgScore) / goals.targetScore) * 100, 100);
    const perfectScoresCount = myAttempts.filter(a => a.score === a.total).length;
    const perfectScoresProgress = Math.min((perfectScoresCount / goals.perfectScores) * 100, 100);
    
    // Calculate weekly quizzes (last 7 days)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyQuizzesCount = myAttempts.filter(a => a.submittedAt > oneWeekAgo).length;
    const weeklyQuizzesProgress = Math.min((weeklyQuizzesCount / goals.weeklyQuizzes) * 100, 100);

    // Calculate streak (consecutive days with quizzes)
    const streak = calculateStreak();
    const streakProgress = Math.min((streak / goals.streak) * 100, 100);

    return {
      avgScoreProgress,
      perfectScoresCount,
      perfectScoresProgress,
      weeklyQuizzesCount,
      weeklyQuizzesProgress,
      streak,
      streakProgress
    };
  };

  const calculateStreak = () => {
    if (myAttempts.length === 0) return 0;

    const sortedAttempts = [...myAttempts].sort((a, b) => b.submittedAt - a.submittedAt);
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let attempt of sortedAttempts) {
      const attemptDate = new Date(attempt.submittedAt);
      attemptDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - attemptDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  const getMotivationalMessage = (progress) => {
    const avgProgress = (
      progress.avgScoreProgress + 
      progress.perfectScoresProgress + 
      progress.weeklyQuizzesProgress + 
      progress.streakProgress
    ) / 4;

    if (avgProgress >= 90) return { emoji: "🎉", message: "Amazing! You're crushing your goals!" };
    if (avgProgress >= 70) return { emoji: "🚀", message: "Great progress! Keep it up!" };
    if (avgProgress >= 50) return { emoji: "💪", message: "You're halfway there! Stay focused!" };
    if (avgProgress >= 25) return { emoji: "🌱", message: "Good start! Keep pushing forward!" };
    return { emoji: "🎯", message: "Set your goals and start your journey!" };
  };

  const progress = calculateProgress();
  const motivation = getMotivationalMessage(progress);

  const achievements = [
    { 
      id: 'first_quiz', 
      name: 'First Steps', 
      description: 'Complete your first quiz',
      icon: '🎯',
      unlocked: myAttempts.length >= 1
    },
    { 
      id: 'perfect_score', 
      name: 'Perfectionist', 
      description: 'Get a perfect score',
      icon: '💯',
      unlocked: progress.perfectScoresCount >= 1
    },
    { 
      id: 'five_quizzes', 
      name: 'Dedicated Learner', 
      description: 'Complete 5 quizzes',
      icon: '📚',
      unlocked: myAttempts.length >= 5
    },
    { 
      id: 'week_streak', 
      name: 'Week Warrior', 
      description: '7-day streak',
      icon: '🔥',
      unlocked: progress.streak >= 7
    },
    { 
      id: 'high_achiever', 
      name: 'High Achiever', 
      description: 'Average score above 80%',
      icon: '⭐',
      unlocked: stats && parseFloat(stats.avgScore) >= 80
    },
    { 
      id: 'ten_quizzes', 
      name: 'Quiz Master', 
      description: 'Complete 10 quizzes',
      icon: '👑',
      unlocked: myAttempts.length >= 10
    }
  ];

  return (
    <div>
      {/* Motivational Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '30px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{motivation.emoji}</div>
        <h2 style={{ color: 'white', marginBottom: '8px' }}>{motivation.message}</h2>
        <p style={{ opacity: 0.9, fontSize: '14px' }}>
          Keep working towards your goals and unlock achievements!
        </p>
      </div>

      {/* Goals Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>My Goals</h3>
          <button 
            onClick={() => setShowSetGoals(!showSetGoals)}
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            {showSetGoals ? 'Cancel' : '⚙️ Set Goals'}
          </button>
        </div>

        {showSetGoals && (
          <form onSubmit={saveGoals} style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Target Average Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editGoals.targetScore}
                  onChange={(e) => setEditGoals({...editGoals, targetScore: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Weekly Quizzes Goal
                </label>
                <input
                  type="number"
                  min="1"
                  value={editGoals.weeklyQuizzes}
                  onChange={(e) => setEditGoals({...editGoals, weeklyQuizzes: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Perfect Scores Goal
                </label>
                <input
                  type="number"
                  min="1"
                  value={editGoals.perfectScores}
                  onChange={(e) => setEditGoals({...editGoals, perfectScores: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Streak Goal (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editGoals.streak}
                  onChange={(e) => setEditGoals({...editGoals, streak: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <button type="submit" style={{ marginTop: '16px', width: '100%' }}>
              Save Goals
            </button>
          </form>
        )}

        {/* Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Average Score Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>📈 Average Score Goal</span>
              <span style={{ color: '#64748b' }}>
                {stats ? stats.avgScore : 0}% / {goals.targetScore}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.avgScoreProgress || 0}%` }}
              />
            </div>
          </div>

          {/* Weekly Quizzes Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>📅 Weekly Quizzes</span>
              <span style={{ color: '#64748b' }}>
                {progress.weeklyQuizzesCount || 0} / {goals.weeklyQuizzes}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.weeklyQuizzesProgress || 0}%` }}
              />
            </div>
          </div>

          {/* Perfect Scores Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>💯 Perfect Scores</span>
              <span style={{ color: '#64748b' }}>
                {progress.perfectScoresCount || 0} / {goals.perfectScores}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.perfectScoresProgress || 0}%` }}
              />
            </div>
          </div>

          {/* Streak Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>🔥 Current Streak</span>
              <span style={{ color: '#64748b' }}>
                {progress.streak || 0} / {goals.streak} days
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.streakProgress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>🏆 Achievements</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
          gap: '16px' 
        }}>
          {achievements.map(achievement => (
            <div 
              key={achievement.id}
              className="achievement-badge"
              style={{
                opacity: achievement.unlocked ? 1 : 0.4,
                filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                {achievement.icon}
              </div>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                {achievement.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {achievement.description}
              </div>
              {achievement.unlocked && (
                <div style={{ 
                  marginTop: '8px', 
                  color: '#10b981', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ✓ Unlocked
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
