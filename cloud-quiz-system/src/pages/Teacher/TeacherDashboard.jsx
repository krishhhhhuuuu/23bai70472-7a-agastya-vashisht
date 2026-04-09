import { useState, useContext, useEffect } from "react";
import { createQuiz, addQuestionToQuiz, getAllQuizzes, getQuizAttempts, getAttemptsByTeacher, deleteAllQuizzesByTeacher } from "../../services/quizService";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import { SkeletonCard } from "../../components/Loading";
import SubjectManager from "./SubjectManager";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { getAllUsers } from "../../services/userService";

const NAV_ITEMS = [
  { key: 'overview',  icon: '🏠', label: 'Overview' },
  { key: 'subjects',  icon: '📚', label: 'Subjects & Syllabus' },
  { key: 'quizzes',   icon: '📝', label: 'My Quizzes' },
  { key: 'create',    icon: '➕', label: 'Create Quiz' },
  { key: 'reports',   icon: '📊', label: 'Reports' },
  { key: 'messages',  icon: '💬', label: 'Student Messages' },
];

export default function TeacherDashboard() {
  const { currentUser } = useContext(AuthContext);
  const { success, error, warning } = useContext(ToastContext);
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState('overview');
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Messages state
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Create quiz form
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    setLoadingQuizzes(true);
    const data = await getAllQuizzes();
    const mine = data.filter(q => q.createdBy === currentUser.uid);
    setQuizzes(mine);
    setLoadingQuizzes(false);
    // Load attempts for flagged count
    const allAttempts = await getAttemptsByTeacher(currentUser.uid).catch(() => []);
    setAttempts(allAttempts);
    setFlaggedCount(allAttempts.filter(a => a.suspiciousActivity).length);
  };

  // Load students who messaged this teacher + unread count
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUser.uid)
    );
    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUnreadMessages(msgs.filter(m => !m.read).length);
      // Unique senders
      const senderIds = [...new Set(msgs.map(m => m.senderId))];
      const users = await getAllUsers().catch(() => []);
      setStudents(users.filter(u => senderIds.includes(u.id) || u.role === 'student'));
    });
    return () => unsub();
  }, []);

  // Load chat with selected student
  useEffect(() => {
    if (!selectedStudent) return;
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.participants.includes(selectedStudent.id));
      setChatMessages(msgs);
    });
    return () => unsub();
  }, [selectedStudent]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      senderId: currentUser.uid,
      receiverId: selectedStudent.id,
      participants: [currentUser.uid, selectedStudent.id],
      timestamp: serverTimestamp(),
      read: true,
    });
    setNewMessage('');
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    await createQuiz({
      title, topic,
      duration: Number(duration),
      deadline: deadline ? new Date(deadline).getTime() : null,
      createdBy: currentUser.uid,
    });
    success(`Quiz "${title}" created!`, 3000);
    setTitle(''); setTopic(''); setDuration(''); setDeadline('');
    loadQuizzes();
    setActiveNav('quizzes');
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete ALL ${quizzes.length} quizzes? This cannot be undone.`)) return;
    setDeletingAll(true);
    try {
      const count = await deleteAllQuizzesByTeacher(currentUser.uid);
      success(`Deleted ${count} quizzes.`, 3000);
      loadQuizzes();
    } catch (err) {
      error(err.message, 4000);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) { warning('Select a quiz first', 3000); return; }
    await addQuestionToQuiz(selectedQuiz, { questionText, options, correctIndex: Number(correctIndex) });
    success('Question added!', 2000);
    setQuestionText(''); setOptions(['', '', '', '']); setCorrectIndex(null);
  };

  const totalAttempts = 0; // placeholder

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: '220px', flexShrink: 0,
          background: '#0f172a',
          display: 'flex', flexDirection: 'column',
          padding: '16px 10px',
          gap: '4px',
          overflowY: 'auto',
        }}>
          {/* Teacher info */}
          <div style={{ padding: '12px 10px 16px', borderBottom: '1px solid #1e293b', marginBottom: '8px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#667eea,#764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', marginBottom: '8px',
            }}>👨‍🏫</div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>Teacher</div>
            <div style={{ color: '#64748b', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.email}
            </div>
          </div>

          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                background: activeNav === item.key ? 'linear-gradient(135deg,#667eea20,#764ba220)' : 'transparent',
                border: activeNav === item.key ? '1px solid #667eea40' : '1px solid transparent',
                color: activeNav === item.key ? '#a5b4fc' : '#64748b',
                fontSize: '13px', fontWeight: activeNav === item.key ? '700' : '500',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = '#1e293b'; }}
              onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
              {item.key === 'reports' && flaggedCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>{flaggedCount}</span>
              )}
              {item.key === 'messages' && unreadMessages > 0 && (
                <span style={{ marginLeft: 'auto', background: '#667eea', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>{unreadMessages}</span>
              )}
            </button>
          ))}

          {/* AI Generator button */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
            <button
              onClick={() => navigate('/teacher/ai-generator')}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                borderRadius: '12px', fontSize: '13px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(102,126,234,0.35)',
              }}
            >
              🤖 AI Generator
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>

          {/* ── OVERVIEW ── */}
          {activeNav === 'overview' && (
            <div style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                Welcome back 👋
              </h2>
              <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>
                {currentUser?.email}
              </p>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Quizzes',   value: quizzes.length,                              icon: '📝', color: '#667eea' },
                  { label: 'AI Generated',    value: quizzes.filter(q => q.aiGenerated).length,   icon: '🤖', color: '#764ba2' },
                  { label: 'Total Attempts',  value: attempts.length,                             icon: '👥', color: '#10b981' },
                  { label: 'Flagged',         value: flaggedCount,                                icon: '🚩', color: flaggedCount > 0 ? '#ef4444' : '#94a3b8' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '14px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
                {[
                  { label: 'AI Quiz Generator', desc: 'Generate quizzes from syllabus', icon: '🤖', action: () => navigate('/teacher/ai-generator'), color: 'linear-gradient(135deg,#667eea,#764ba2)' },
                  { label: 'Manage Subjects', desc: 'Upload syllabus & units', icon: '📚', action: () => setActiveNav('subjects'), color: 'linear-gradient(135deg,#10b981,#059669)' },
                  { label: 'Create Quiz', desc: 'Build a quiz manually', icon: '➕', action: () => setActiveNav('create'), color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
                  { label: 'View Reports', desc: 'Student performance', icon: '📊', action: () => navigate('/teacher/reports'), color: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
                ].map((a, i) => (
                  <div
                    key={i}
                    onClick={a.action}
                    style={{
                      background: 'white', borderRadius: '16px', padding: '20px',
                      border: '1px solid #e2e8f0', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '12px' }}>
                      {a.icon}
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>{a.label}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{a.desc}</div>
                  </div>
                ))}
              </div>

              {/* Recent quizzes */}
              {quizzes.length > 0 && (
                <div style={{ marginTop: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '14px' }}>Recent Quizzes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quizzes.slice(0, 4).map(quiz => (
                      <div key={quiz.id} style={{ background: 'white', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{quiz.title}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            {quiz.topic} · {quiz.duration} min {quiz.aiGenerated ? '· 🤖 AI' : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => navigate(`/teacher/edit/${quiz.id}`)} style={{ background: '#f1f5f9', color: '#374151', padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}>Edit</button>
                          <button onClick={() => navigate(`/teacher/analytics/${quiz.id}`)} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}>Analytics</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SUBJECTS ── */}
          {activeNav === 'subjects' && <SubjectManager />}

          {/* ── QUIZZES ── */}
          {activeNav === 'quizzes' && (
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Quizzes</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {quizzes.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      disabled={deletingAll}
                      style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', opacity: deletingAll ? 0.6 : 1 }}
                    >
                      {deletingAll ? '⏳ Deleting…' : `🗑️ Delete All (${quizzes.length})`}
                    </button>
                  )}
                  <button onClick={() => setActiveNav('create')} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700' }}>
                    + Create Quiz
                  </button>
                </div>
              </div>
              {loadingQuizzes ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ color: '#374151', marginBottom: '8px' }}>No quizzes yet</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Create your first quiz manually or use the AI generator</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => setActiveNav('create')} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', padding: '10px 20px' }}>Create Manually</button>
                    <button onClick={() => navigate('/teacher/ai-generator')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '10px', padding: '10px 20px' }}>🤖 AI Generator</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                  {quizzes.map(quiz => (
                    <div key={quiz.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a', flex: 1 }}>{quiz.title}</h3>
                        {quiz.aiGenerated && <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', flexShrink: 0, marginLeft: '8px' }}>🤖 AI</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>📚 {quiz.topic}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>⏱️ {quiz.duration} minutes{quiz.deadline ? ` · 📅 Due ${new Date(quiz.deadline).toLocaleDateString()}` : ''}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/teacher/edit/${quiz.id}`)} style={{ flex: 1, background: '#f1f5f9', color: '#374151', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '600' }}>✏️ Edit</button>
                        <button onClick={() => navigate(`/teacher/analytics/${quiz.id}`)} style={{ flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '600' }}>📊 Analytics</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE QUIZ ── */}
          {activeNav === 'create' && (
            <div style={{ padding: '28px', maxWidth: '700px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>Create New Quiz</h2>

              <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#374151' }}>Quiz Details</h3>
                <form onSubmit={handleCreateQuiz}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Title *</label>
                      <input placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Topic *</label>
                      <input placeholder="e.g., Mathematics" value={topic} onChange={e => setTopic(e.target.value)} required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Duration (min) *</label>
                      <input type="number" placeholder="30" min="1" value={duration} onChange={e => setDuration(e.target.value)} required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>📅 Deadline (optional)</label>
                      <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <button type="submit" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '12px', padding: '12px 28px', fontWeight: '700', fontSize: '14px' }}>
                    Create Quiz
                  </button>
                </form>
              </div>

              {quizzes.length > 0 && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#374151' }}>Add Questions</h3>
                  <select value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', marginBottom: '16px', background: 'white' }}>
                    <option value="">-- Select a Quiz --</option>
                    {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </select>

                  {selectedQuiz && (
                    <form onSubmit={handleAddQuestion}>
                      <input placeholder="Question Text" value={questionText} onChange={e => setQuestionText(e.target.value)} required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {options.map((opt, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} required />
                            <input placeholder={`Option ${i + 1}`} value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }} required
                              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px' }} />
                          </div>
                        ))}
                      </div>
                      <button type="submit" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '10px', padding: '10px 24px', fontWeight: '700', fontSize: '14px' }}>
                        + Add Question
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeNav === 'reports' && (
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Student Reports</h2>
                <button onClick={() => navigate('/teacher/reports')} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700' }}>
                  📊 Full Reports Page
                </button>
              </div>

              {flaggedCount > 0 && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🚩</span>
                  <div>
                    <p style={{ fontWeight: '700', color: '#dc2626', margin: '0 0 2px' }}>{flaggedCount} flagged attempt{flaggedCount > 1 ? 's' : ''} detected</p>
                    <p style={{ color: '#9f1239', fontSize: '13px', margin: 0 }}>Students with suspicious activity during quizzes</p>
                  </div>
                </div>
              )}

              {attempts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <h3 style={{ color: '#374151' }}>No attempts yet</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>Students haven't taken your quizzes yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {attempts.sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 10).map(attempt => {
                    const pct = ((attempt.score / attempt.total) * 100).toFixed(1);
                    const quiz = quizzes.find(q => q.id === attempt.quizId);
                    return (
                      <div key={attempt.id} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', border: `1px solid ${attempt.suspiciousActivity ? '#fca5a5' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{attempt.studentEmail || attempt.studentId?.slice(0, 8) + '…'}</div>
                          <div style={{ fontSize: '12px', color: '#667eea', marginTop: '2px' }}>{quiz?.title || 'Quiz'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{new Date(attempt.submittedAt).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {attempt.suspiciousActivity && <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px' }}>🚩 Flagged</span>}
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', background: pct >= 50 ? '#dcfce7' : '#fee2e2', color: pct >= 50 ? '#15803d' : '#dc2626' }}>
                            {attempt.score}/{attempt.total} ({pct}%)
                          </span>
                          <button onClick={() => navigate(`/teacher/analytics/${attempt.quizId}`)} style={{ background: '#f1f5f9', color: '#374151', padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}>Details</button>
                        </div>
                      </div>
                    );
                  })}
                  {attempts.length > 10 && (
                    <button onClick={() => navigate('/teacher/reports')} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '12px', padding: '12px', fontWeight: '700', fontSize: '14px' }}>
                      View All {attempts.length} Attempts →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {activeNav === 'messages' && (
            <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
              {/* Student list */}
              <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>💬 Student Messages</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {students.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No messages yet</div>
                  ) : students.map(student => (
                    <div key={student.id} onClick={() => setSelectedStudent(student)}
                      style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: selectedStudent?.id === student.id ? '#ede9fe' : 'transparent', borderLeft: selectedStudent?.id === student.id ? '3px solid #667eea' : '3px solid transparent', transition: 'all 0.15s' }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>{student.email}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Student</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                {!selectedStudent ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                    <p>Select a student to view messages</p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{selectedStudent.email}</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {chatMessages.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontSize: '14px' }}>No messages yet</div>}
                      {chatMessages.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: msg.senderId === currentUser.uid ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.senderId === currentUser.uid ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'white', color: msg.senderId === currentUser.uid ? 'white' : '#1e293b', fontSize: '14px', lineHeight: '1.5', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            {msg.text}
                            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{msg.timestamp?.toDate().toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', gap: '10px' }}>
                      <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Reply to student..." style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px' }} />
                      <button type="submit" disabled={!newMessage.trim()} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', padding: '10px 20px', fontWeight: '700', fontSize: '14px' }}>Send</button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
