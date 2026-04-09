import { useState, useRef, useEffect } from 'react';
import { askAITutor } from '../services/aiService';

/**
 * AI Tutor chat panel - shown after quiz submission on the Result page
 * Props:
 *   questions: array of quiz questions
 *   answers: { [questionId]: selectedIndex }
 */
export default function AITutor({ questions = [], answers = {} }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!userQuery.trim() || !selectedQuestion) return;

    const q = selectedQuestion;
    const studentAnswerIndex = answers[q.id];
    const studentAnswer = studentAnswerIndex !== undefined ? q.options[studentAnswerIndex] : 'Not answered';
    const correctAnswer = q.options[q.correctIndex];

    const userMsg = userQuery.trim();
    setUserQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await askAITutor({
        question: q.questionText,
        studentAnswer,
        correctAnswer,
        explanation: q.explanation || '',
        userQuery: userMsg,
      });

      setChatHistory(prev => [...prev, { role: 'ai', text: result.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I could not connect to the AI tutor right now. Please try again.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const selectQuestion = (q) => {
    setSelectedQuestion(q);
    setChatHistory([]);
    setUserQuery('');
  };

  const isCorrect = (q) => {
    const studentIdx = answers[q.id];
    return studentIdx !== undefined && Number(studentIdx) === Number(q.correctIndex);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 24px',
        color: 'white',
      }}>
        <h3 style={{ color: 'white', margin: 0, marginBottom: '4px' }}>🤖 AI Tutor</h3>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>
          Select a question below to get an explanation or ask anything about it
        </p>
      </div>

      <div style={{ display: 'flex', height: '500px' }}>
        {/* Question list */}
        <div style={{
          width: '220px',
          borderRight: '1px solid #e2e8f0',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {questions.map((q, i) => {
            const correct = isCorrect(q);
            const answered = answers[q.id] !== undefined;
            return (
              <div
                key={q.id}
                onClick={() => selectQuestion(q)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  background: selectedQuestion?.id === q.id ? '#ede9fe' : 'transparent',
                  borderLeft: selectedQuestion?.id === q.id ? '3px solid #667eea' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Q{i + 1}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: !answered ? '#94a3b8' : correct ? '#10b981' : '#ef4444',
                  }}>
                    {!answered ? '—' : correct ? '✓' : '✗'}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#475569',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4',
                }}>
                  {q.questionText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedQuestion ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👈</div>
              <p style={{ margin: 0, fontSize: '15px' }}>Select a question from the list to start chatting with the AI tutor</p>
            </div>
          ) : (
            <>
              {/* Selected question context */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  {selectedQuestion.questionText}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: '#dcfce7',
                    color: '#166534',
                  }}>
                    ✓ Correct: {selectedQuestion.options[selectedQuestion.correctIndex]}
                  </span>
                  {answers[selectedQuestion.id] !== undefined && (
                    <span style={{
                      fontSize: '12px',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: isCorrect(selectedQuestion) ? '#dcfce7' : '#fee2e2',
                      color: isCorrect(selectedQuestion) ? '#166534' : '#991b1b',
                    }}>
                      You: {selectedQuestion.options[answers[selectedQuestion.id]]}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatHistory.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                    Ask anything about this question — why the answer is correct, what the concept means, or how to remember it.
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : msg.isError ? '#fee2e2' : '#f1f5f9',
                      color: msg.role === 'user' ? 'white' : msg.isError ? '#991b1b' : '#1e293b',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                      {msg.role === 'ai' && (
                        <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px', opacity: 0.7 }}>
                          🤖 AI Tutor
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: '6px', padding: '8px 0' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#667eea',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleAsk} style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '10px',
              }}>
                <input
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Ask about this question..."
                  disabled={loading}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                />
                <button
                  type="submit"
                  disabled={loading || !userQuery.trim()}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: loading || !userQuery.trim() ? 0.6 : 1,
                    fontSize: '14px',
                  }}
                >
                  Ask
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
