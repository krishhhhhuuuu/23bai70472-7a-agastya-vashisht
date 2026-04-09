import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import AITutor from '../../components/AITutor';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // state passed from QuizAttempt on submit
  const { score, total, questions = [], answers = {}, quizTitle = 'Quiz' } = state || {};

  if (!state) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="empty-state">
            <h3>No result data</h3>
            <p>Please complete a quiz first.</p>
            <button onClick={() => navigate('/student')}>Go to Dashboard</button>
          </div>
        </div>
      </>
    );
  }

  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 50;

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981', label: 'Outstanding!' };
    if (percentage >= 80) return { grade: 'A', color: '#10b981', label: 'Excellent!' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6', label: 'Good Job!' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b', label: 'Keep Practicing' };
    if (percentage >= 50) return { grade: 'D', color: '#f59e0b', label: 'Just Passed' };
    return { grade: 'F', color: '#ef4444', label: 'Keep Trying!' };
  };

  const { grade, color, label } = getGrade();

  return (
    <>
      <Navbar />
      <div className="dashboard-container">

        {/* Score Card */}
        <div className="card" style={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderTop: `4px solid ${color}`,
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '72px', fontWeight: '900', color, lineHeight: 1, marginBottom: '8px' }}>
            {grade}
          </div>
          <h2 style={{ marginBottom: '8px', color: '#1e293b' }}>{label}</h2>
          <p style={{ fontSize: '24px', fontWeight: '700', color, marginBottom: '4px' }}>
            {score} / {total} correct
          </p>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '20px' }}>
            {percentage}% — {quizTitle}
          </p>

          {/* Progress bar */}
          <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '12px', maxWidth: '400px', margin: '0 auto 24px' }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              borderRadius: '999px',
              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
              transition: 'width 1s ease',
            }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/student')}>← Back to Dashboard</button>
            <button
              onClick={() => navigate('/student')}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Take Another Quiz
            </button>
          </div>
        </div>

        {/* Question Review */}
        {questions.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>📋 Answer Explanations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, i) => {
                const studentIdx = answers[q.id];
                const correct = studentIdx !== undefined && Number(studentIdx) === Number(q.correctIndex);
                const notAnswered = studentIdx === undefined;

                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      border: `1.5px solid ${notAnswered ? '#e2e8f0' : correct ? '#86efac' : '#fca5a5'}`,
                      background: notAnswered ? '#f8fafc' : correct ? '#f0fdf4' : '#fff5f5',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#64748b', fontSize: '13px' }}>Q{i + 1}</span>
                      <span style={{
                        fontSize: '13px', fontWeight: '700',
                        color: notAnswered ? '#94a3b8' : correct ? '#10b981' : '#ef4444',
                      }}>
                        {notAnswered ? '— Not answered' : correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      {q.difficulty && (
                        <span style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                          background: q.difficulty === 'easy' ? '#dcfce7' : q.difficulty === 'hard' ? '#fee2e2' : '#fef9c3',
                          color: q.difficulty === 'easy' ? '#166534' : q.difficulty === 'hard' ? '#991b1b' : '#854d0e',
                          textTransform: 'capitalize',
                        }}>{q.difficulty}</span>
                      )}
                    </div>

                    <p style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px', lineHeight: '1.6' }}>{q.questionText}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {q.options.map((opt, oi) => {
                        const isCorrectOpt  = oi === Number(q.correctIndex);
                        const isStudentOpt  = oi === Number(studentIdx);
                        return (
                          <div key={oi} style={{
                            padding: '9px 14px', borderRadius: '10px', fontSize: '13px',
                            background: isCorrectOpt ? '#dcfce7' : isStudentOpt && !correct ? '#fee2e2' : '#f8fafc',
                            border: `1px solid ${isCorrectOpt ? '#86efac' : isStudentOpt && !correct ? '#fca5a5' : '#e2e8f0'}`,
                            display: 'flex', alignItems: 'center', gap: '10px',
                          }}>
                            <span style={{ fontWeight: '700', minWidth: '18px', color: isCorrectOpt ? '#10b981' : isStudentOpt && !correct ? '#ef4444' : '#94a3b8' }}>
                              {isCorrectOpt ? '✓' : isStudentOpt && !correct ? '✗' : String.fromCharCode(65 + oi)}
                            </span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isCorrectOpt && <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>Correct Answer</span>}
                            {isStudentOpt && !correct && <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation — always shown, highlighted for wrong answers */}
                    {q.explanation ? (
                      <div style={{
                        padding: '12px 16px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.7',
                        background: correct ? '#eff6ff' : '#fefce8',
                        borderLeft: `4px solid ${correct ? '#3b82f6' : '#f59e0b'}`,
                        color: correct ? '#1e40af' : '#92400e',
                      }}>
                        <span style={{ fontWeight: '700', marginRight: '6px' }}>💡 Explanation:</span>
                        {q.explanation}
                      </div>
                    ) : !correct && (
                      <div style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', background: '#fefce8', borderLeft: '4px solid #f59e0b', color: '#92400e' }}>
                        💡 The correct answer is: <strong>{q.options[q.correctIndex]}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Tutor */}
        {questions.length > 0 && (
          <AITutor questions={questions} answers={answers} />
        )}

      </div>
    </>
  );
}
