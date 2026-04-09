import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubjectDetail } from '../../services/subjectService';
import { AuthContext } from '../../context/AuthContext';
import { askAITutor } from '../../services/aiService';
import Navbar from '../../components/Navbar';

const SUBJECT_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#3b82f6,#2563eb)',
  'linear-gradient(135deg,#ec4899,#db2777)',
];

/* ── Inline AI Tutor for syllabus learning ── */
function SyllabusAITutor({ subject, units }) {
  const [query, setQuery]       = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      // Build context from syllabus
      const context = selectedUnit
        ? `Unit: ${selectedUnit.name}\n${selectedUnit.content}`
        : subject.fullSyllabus || units.map(u => `${u.name}: ${u.content}`).join('\n\n');

      const result = await askAITutor({
        question: `Syllabus topic from ${subject.name}`,
        studentAnswer: '',
        correctAnswer: context.substring(0, 500),
        explanation: context.substring(0, 1000),
        userQuery: q,
      });
      setMessages(prev => [...prev, { role: 'ai', text: result.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Could not reach AI tutor. Please try again.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Summarise this topic',
    'Give me key points to remember',
    'Explain this in simple terms',
    'What are common exam questions on this?',
  ];

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '18px 22px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '22px' }}>🤖</span>
          <h3 style={{ color: 'white', margin: 0, fontSize: '17px', fontWeight: '700' }}>AI Study Tutor</h3>
        </div>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '13px' }}>Ask anything about this subject's syllabus</p>
      </div>

      {/* Unit selector */}
      {units.length > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Focus on a unit (optional):</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedUnit(null)}
              style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                border: '1.5px solid', cursor: 'pointer',
                borderColor: !selectedUnit ? '#667eea' : '#e2e8f0',
                background: !selectedUnit ? '#ede9fe' : 'white',
                color: !selectedUnit ? '#4f46e5' : '#64748b',
              }}
            >All</button>
            {units.map(u => (
              <button key={u.id}
                onClick={() => setSelectedUnit(u)}
                style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  border: '1.5px solid', cursor: 'pointer',
                  borderColor: selectedUnit?.id === u.id ? '#667eea' : '#e2e8f0',
                  background: selectedUnit?.id === u.id ? '#ede9fe' : 'white',
                  color: selectedUnit?.id === u.id ? '#4f46e5' : '#64748b',
                }}
              >{u.name}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ height: '320px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>Ask me anything about {subject.name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {quickPrompts.map(p => (
                <button key={p} onClick={() => setQuery(p)}
                  style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >{p}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', fontSize: '14px', lineHeight: '1.6',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg,#667eea,#764ba2)' : msg.isError ? '#fee2e2' : '#f1f5f9',
              color: msg.role === 'user' ? 'white' : msg.isError ? '#991b1b' : '#1e293b',
            }}>
              {msg.role === 'ai' && <div style={{ fontSize: '11px', fontWeight: '700', opacity: 0.6, marginBottom: '3px' }}>🤖 AI Tutor</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '5px', padding: '4px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask about the syllabus..."
          disabled={loading}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = '#667eea'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button type="submit" disabled={loading || !query.trim()}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', fontWeight: '700', fontSize: '14px', opacity: loading || !query.trim() ? 0.6 : 1 }}
        >Ask</button>
      </form>
    </div>
  );
}

/* ── Main SubjectDetail page ── */
export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('syllabus'); // syllabus | quizzes | tutor
  const [expandedUnit, setExpandedUnit] = useState(null);

  useEffect(() => {
    getSubjectDetail(subjectId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    </>
  );

  if (!data?.subject) return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="empty-state"><h3>Subject not found</h3></div>
      </div>
    </>
  );

  const { subject, units = [], quizzes = [] } = data;
  const gradient = SUBJECT_GRADIENTS[subject.colorIndex % SUBJECT_GRADIENTS.length];

  const TABS = [
    { key: 'syllabus', label: '📖 Syllabus' },
    { key: 'quizzes',  label: `📝 Quizzes (${quizzes.length})` },
    { key: 'tutor',    label: '🤖 AI Tutor' },
  ];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Back */}
        <button onClick={() => navigate('/student')}
          style={{ background: 'rgba(255,255,255,0.9)', color: '#64748b', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '13px', padding: '8px 16px', borderRadius: '10px' }}
        >← Back</button>

        {/* Hero banner */}
        <div style={{ background: gradient, borderRadius: '24px', padding: '32px', color: 'white', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>{subject.name}</h1>
          {subject.description && <p style={{ opacity: 0.85, fontSize: '15px', margin: 0 }}>{subject.description}</p>}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              📑 {units.length} unit{units.length !== 1 ? 's' : ''}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              📝 {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === t.key ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'transparent',
                color: activeTab === t.key ? 'white' : '#64748b',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── SYLLABUS TAB ── */}
        {activeTab === 'syllabus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {subject.fullSyllabus && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>📄 Full Syllabus Overview</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {subject.fullSyllabus}
                </p>
              </div>
            )}

            {units.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📑</div>
                <p>No units added yet</p>
              </div>
            ) : units.map((unit, i) => (
              <div key={unit.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                  style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                      {unit.order || i + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{unit.name}</h4>
                      {unit.topics?.length > 0 && (
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8' }}>{unit.topics.length} topics</p>
                      )}
                    </div>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '18px', transition: 'transform 0.2s', transform: expandedUnit === unit.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>

                {expandedUnit === unit.id && (
                  <div style={{ padding: '0 22px 20px', borderTop: '1px solid #f1f5f9' }}>
                    {unit.topics?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '14px 0 12px' }}>
                        {unit.topics.map((t, ti) => (
                          <span key={ti} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#ede9fe', color: '#7c3aed', fontWeight: '600' }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-wrap', margin: 0 }}>{unit.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── QUIZZES TAB ── */}
        {activeTab === 'quizzes' && (
          <div>
            {quizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                <h3 style={{ color: '#475569', marginBottom: '8px' }}>No quizzes yet</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Your teacher hasn't added quizzes for this subject yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {quizzes.map(quiz => (
                  <div key={quiz.id} style={{ background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{quiz.title}</h3>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>📚 {quiz.topic}</span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>⏱️ {quiz.duration} min</span>
                        {quiz.aiGenerated && <span style={{ fontSize: '13px', color: '#667eea', fontWeight: '600' }}>🤖 AI Generated</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      style={{ background: gradient, padding: '10px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' }}
                    >Start Quiz →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AI TUTOR TAB ── */}
        {activeTab === 'tutor' && (
          <SyllabusAITutor subject={subject} units={units} />
        )}

      </div>
    </>
  );
}
