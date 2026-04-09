import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateQuizFromSyllabus, publishDraftQuestion, publishAllDraftQuestions, rejectDraftQuestion } from '../../services/aiService';
import { createQuiz } from '../../services/quizService';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Navbar from '../../components/Navbar';
import SyllabusUploader from '../../components/SyllabusUploader';

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, delay = 0, direction = 'up', style = {} }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'none'
          : direction === 'up' ? 'translateY(28px)'
          : direction === 'left' ? 'translateX(-24px)'
          : 'translateX(24px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Step indicator ── */
function Steps({ current }) {
  const steps = [
    { label: 'Setup',    icon: '📋' },
    { label: 'Generate', icon: '🤖' },
    { label: 'Review',   icon: '✅' },
  ];
  return (
    <div className="ai-gen-steps">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'inactive';
        return (
          <div key={i} className={`ai-gen-step ${state}`}>
            <div className="ai-gen-step-circle">
              {state === 'done' ? '✓' : s.icon}
            </div>
            <span className="ai-gen-step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const DIFF_COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444', mixed: '#a855f7' };

export default function AIQuizGenerator() {
  const { currentUser } = useContext(AuthContext);
  const { success, error, info, warning } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill from SubjectManager navigation state
  const fromSubject = location.state;

  const [quizTitle, setQuizTitle]     = useState('');
  const [quizTopic, setQuizTopic]     = useState(fromSubject?.subjectName || '');
  const [quizDuration, setQuizDuration] = useState(30);
  const [syllabusText, setSyllabusText] = useState(fromSubject?.fullSyllabus || '');
  const [questionCount, setQuestionCount] = useState(8);
  const [difficulty, setDifficulty]   = useState('mixed');

  // Generation mode
  const [generateFrom, setGenerateFrom] = useState(fromSubject?.generateFrom || 'syllabus');
  const [selectedUnit, setSelectedUnit] = useState(fromSubject?.selectedUnit || null);
  const [customTopic, setCustomTopic]   = useState('');
  const availableUnits = fromSubject?.units || [];

  const [step, setStep]               = useState(0); // 0=setup 1=generating 2=review 3=done
  const [questions, setQuestions]     = useState([]);
  const [syllabusInputMode, setSyllabusInputMode] = useState('uploader'); // 'uploader' | 'manual'
  const [editingIdx, setEditingIdx]   = useState(null);
  const [editForm, setEditForm]       = useState(null);
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [publishingSet, setPublishingSet] = useState(new Set());
  const [publishAllLoading, setPublishAllLoading] = useState(false);

  // Update range slider gradient
  const rangeRef = useRef(null);
  useEffect(() => {
    if (rangeRef.current) {
      const pct = ((questionCount - 3) / (30 - 3)) * 100;
      rangeRef.current.style.setProperty('--pct', `${pct}%`);
    }
  }, [questionCount]);

  /* ── Generate ── */
  const handleGenerate = async (e) => {
    e.preventDefault();

    // Determine what content will actually be used
    const effectiveContent =
      generateFrom === 'unit'  ? selectedUnit?.content :
      generateFrom === 'topic' ? (customTopic.trim() || syllabusText) :
      syllabusText; // 'syllabus' mode

    if (!effectiveContent?.trim()) {
      if (generateFrom === 'unit')  { warning('Please select a unit.', 3000); return; }
      if (generateFrom === 'topic') { warning('Please enter a custom topic.', 3000); return; }
      warning('Please enter some syllabus content.', 3000); return;
    }

    setStep(1);
    try {
      const quizId = await createQuiz({
        title: quizTitle, topic: quizTopic,
        duration: Number(quizDuration),
        createdBy: currentUser.uid, aiGenerated: true,
        subjectId: fromSubject?.subjectId || null,
      });
      setCreatedQuizId(quizId);

      // Determine content to send
      let contentToSend = effectiveContent;
      let focusTopic =
        generateFrom === 'unit'  ? selectedUnit?.name :
        generateFrom === 'topic' ? customTopic :
        quizTopic;

      const result = await generateQuizFromSyllabus({
        syllabusText: contentToSend,
        count: questionCount, difficulty,
        topic: focusTopic,
        quizId,
        generateFrom,
        unitName: selectedUnit?.name,
        customTopic,
      });

      setQuestions(result.questions.map(q => ({ ...q, approved: false, rejected: false })));
      setStep(2);
      info(`${result.questions.length} questions ready for review.`, 3000);
    } catch (err) {
      error(err.message, 5000);
      setStep(0);
    }
  };

  /* ── Edit ── */
  const startEdit = (i) => { setEditingIdx(i); setEditForm({ ...questions[i] }); };
  const saveEdit  = () => {
    const updated = [...questions];
    updated[editingIdx] = { ...editForm, approved: false };
    setQuestions(updated);
    setEditingIdx(null); setEditForm(null);
  };

  /* ── Publish one ── */
  const handlePublish = async (i) => {
    const q = questions[i];
    if (!q.id) { error('Question ID missing.', 3000); return; }
    setPublishingSet(prev => new Set(prev).add(i));
    try {
      await publishDraftQuestion(createdQuizId, q.id, {
        questionText: q.questionText, options: q.options,
        correctIndex: q.correctIndex, explanation: q.explanation,
        difficulty: q.difficulty, topic: q.topic,
      });
      const updated = [...questions];
      updated[i] = { ...q, approved: true };
      setQuestions(updated);
      success('Published!', 1500);
    } catch (err) { error(err.message, 4000); }
    finally { setPublishingSet(prev => { const s = new Set(prev); s.delete(i); return s; }); }
  };

  /* ── Reject one ── */
  const handleReject = async (i) => {
    const q = questions[i];
    try {
      if (q.id) await rejectDraftQuestion(createdQuizId, q.id);
      const updated = [...questions];
      updated[i] = { ...q, rejected: true };
      setQuestions(updated);
    } catch (err) { error(err.message, 3000); }
  };

  /* ── Publish all — single batch request ── */
  const handlePublishAll = async () => {
    const pending = questions.map((q, i) => ({ q, i })).filter(({ q }) => !q.approved && !q.rejected && q.id);
    if (!pending.length) { info('Nothing pending.', 2000); return; }
    setPublishAllLoading(true);
    try {
      const payload = pending.map(({ q }) => ({
        draftId: q.id,
        edits: {
          questionText: q.questionText,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topic: q.topic,
        },
      }));

      await publishAllDraftQuestions(createdQuizId, payload);

      // Mark all as approved in local state
      const updated = [...questions];
      pending.forEach(({ i }) => { updated[i] = { ...updated[i], approved: true }; });
      setQuestions(updated);
      success(`All ${pending.length} questions published!`, 3000);
      setStep(3);
    } catch (err) {
      error(err.message, 5000);
    } finally {
      setPublishAllLoading(false);
    }
  };

  const publishedCount = questions.filter(q => q.approved).length;
  const rejectedCount  = questions.filter(q => q.rejected).length;
  const pendingCount   = questions.filter(q => !q.approved && !q.rejected).length;

  return (
    <div className="ai-gen-page">
      <Navbar />

      {/* ── Hero ── */}
      <div className="ai-gen-hero">
        <div className="ai-gen-hero-icon">🤖</div>
        <h1>AI Quiz Generator</h1>
        <p>Paste your syllabus and let AI generate professional quiz questions in seconds</p>
        <Steps current={step} />
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Back button ── */}
        <Reveal delay={0}>
          <button
            onClick={() => navigate('/teacher')}
            style={{ background: 'rgba(255,255,255,0.8)', color: '#64748b', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '13px', padding: '8px 16px', borderRadius: '10px' }}
          >
            ← Back to Dashboard
          </button>
        </Reveal>

        {/* ══════════════ STEP 0: SETUP ══════════════ */}
        {step === 0 && (
          <form onSubmit={handleGenerate}>

            {/* Quiz Details */}
            <Reveal delay={60}>
              <div className="glass-card">
                <div className="glass-card-header">
                  <div className="glass-card-icon" style={{ background: '#ede9fe' }}>📋</div>
                  <div>
                    <h3>Quiz Details</h3>
                    <p>Basic information about your quiz</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label className="input-label">Quiz Title *</label>
                    <input className="premium-input" placeholder="e.g., Chapter 3 — Cell Biology" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Topic *</label>
                    <input className="premium-input" placeholder="e.g., Biology, Mathematics" value={quizTopic} onChange={e => setQuizTopic(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Duration (minutes)</label>
                    <input className="premium-input" type="number" min="5" max="180" value={quizDuration} onChange={e => setQuizDuration(e.target.value)} required />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Generation mode selector — shown when coming from subject */}
            {fromSubject && (
              <Reveal delay={100}>
                <div className="glass-card">
                  <div className="glass-card-header">
                    <div className="glass-card-icon" style={{ background: '#dcfce7' }}>🎯</div>
                    <div>
                      <h3>Generation Mode</h3>
                      <p>From subject: {fromSubject.subjectName}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: generateFrom === 'unit' || generateFrom === 'topic' ? '16px' : '0' }}>
                    {[
                      { key: 'syllabus', label: '📄 Full Syllabus', desc: 'Use entire subject syllabus' },
                      { key: 'unit',     label: '📑 Specific Unit',  desc: 'Pick one unit/chapter' },
                      { key: 'topic',    label: '🎯 Custom Topic',   desc: 'Enter any topic' },
                    ].map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setGenerateFrom(m.key)}
                        style={{
                          flex: 1, minWidth: '140px', padding: '12px 16px',
                          borderRadius: '12px', border: '2px solid',
                          borderColor: generateFrom === m.key ? '#667eea' : '#e2e8f0',
                          background: generateFrom === m.key ? '#ede9fe' : 'white',
                          color: generateFrom === m.key ? '#4f46e5' : '#64748b',
                          fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                          transition: 'all 0.2s ease', textAlign: 'left',
                        }}
                      >
                        <div>{m.label}</div>
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  {generateFrom === 'unit' && availableUnits.length > 0 && (
                    <div>
                      <label className="input-label">Select Unit</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {availableUnits.map(u => (
                          <div
                            key={u.id}
                            onClick={() => { setSelectedUnit(u); setSyllabusText(u.content); }}
                            style={{
                              padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                              border: '2px solid', borderColor: selectedUnit?.id === u.id ? '#667eea' : '#e2e8f0',
                              background: selectedUnit?.id === u.id ? '#ede9fe' : '#f8fafc',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{u.name}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{u.content?.length} chars</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generateFrom === 'topic' && (
                    <div>
                      <label className="input-label">Custom Topic</label>
                      <input
                        className="premium-input"
                        placeholder="e.g., Photosynthesis, Newton's Laws, World War 2..."
                        value={customTopic}
                        onChange={e => setCustomTopic(e.target.value)}
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                  )}
                </div>
              </Reveal>
            )}

            {/* Syllabus Content — hidden when subject already provides content */}
            {(() => {
              const hasSubjectContent =
                fromSubject && (
                  (generateFrom === 'unit'    && selectedUnit?.content) ||
                  (generateFrom === 'syllabus' && fromSubject.fullSyllabus) ||
                  (generateFrom === 'topic'   && customTopic.trim())
                );

              if (hasSubjectContent) {
                // Show a read-only summary instead
                const label =
                  generateFrom === 'unit'    ? `Unit: ${selectedUnit.name}` :
                  generateFrom === 'topic'   ? `Topic: ${customTopic}` :
                  `Full syllabus of ${fromSubject.subjectName}`;
                const chars =
                  generateFrom === 'unit'    ? selectedUnit.content?.length :
                  generateFrom === 'topic'   ? null :
                  fromSubject.fullSyllabus?.length;

                return (
                  <Reveal delay={120}>
                    <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '28px' }}>✅</div>
                        <div>
                          <p style={{ fontWeight: '700', color: '#15803d', margin: '0 0 2px', fontSize: '14px' }}>Content ready from subject</p>
                          <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>{label}{chars ? ` · ${chars} chars` : ''}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              }

              return (
                <Reveal delay={120}>
                  <div className="glass-card">
                    <div className="glass-card-header">
                      <div className="glass-card-icon" style={{ background: '#fef9c3' }}>📄</div>
                      <div>
                        <h3>Syllabus Content</h3>
                        <p>Upload a file, image, or paste text — AI will use it to generate questions</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {[['uploader','✨ Smart Upload'], ['manual','✏️ Paste Text']].map(([k, label]) => (
                        <button key={k} type="button"
                          onClick={() => setSyllabusInputMode(k)}
                          style={{
                            padding: '7px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                            border: '2px solid', cursor: 'pointer',
                            borderColor: syllabusInputMode === k ? '#667eea' : '#e2e8f0',
                            background: syllabusInputMode === k ? '#ede9fe' : 'white',
                            color: syllabusInputMode === k ? '#4f46e5' : '#64748b',
                          }}
                        >{label}</button>
                      ))}
                    </div>

                    {syllabusInputMode === 'uploader' ? (
                      <SyllabusUploader
                        subjectName={quizTopic || 'Subject'}
                        onParsed={(result) => {
                          setSyllabusText(result.fullSyllabus || result.extractedText || '');
                          info(`Syllabus organised — ${result.units?.length || 0} units detected. Ready to generate!`, 3000);
                        }}
                        onRawText={(t) => setSyllabusText(t)}
                      />
                    ) : (
                      <textarea
                        className="premium-input"
                        placeholder={`Paste your content here...\n\nExamples:\n• "photosynthesis, cell division, DNA replication"\n• A full textbook chapter\n• Bullet-point notes`}
                        value={syllabusText}
                        onChange={e => setSyllabusText(e.target.value)}
                        rows={8}
                        style={{ resize: 'vertical', lineHeight: '1.7' }}
                      />
                    )}

                    {syllabusText && (
                      <div style={{ marginTop: '10px', padding: '8px 14px', background: '#f0fdf4', borderRadius: '10px', fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✓ {syllabusText.length} characters of syllabus content ready
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })()}

            {/* Settings */}
            <Reveal delay={180}>
              <div className="glass-card">
                <div className="glass-card-header">
                  <div className="glass-card-icon" style={{ background: '#dcfce7' }}>⚙️</div>
                  <div>
                    <h3>Generation Settings</h3>
                    <p>Customize the output</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
                  {/* Count slider */}
                  <div>
                    <label className="input-label">
                      Number of Questions
                    </label>
                    <div className="count-slider-wrap" style={{ marginTop: '28px' }}>
                      <span className="count-slider-value">{questionCount}</span>
                      <input
                        ref={rangeRef}
                        type="range"
                        className="premium-range"
                        min="3" max="30"
                        value={questionCount}
                        onChange={e => setQuestionCount(Number(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                        <span>3</span><span>30</span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="input-label">Difficulty Level</label>
                    <div className="diff-pills" style={{ marginTop: '8px' }}>
                      {[
                        { key: 'easy',   label: '🟢 Easy' },
                        { key: 'medium', label: '🟡 Medium' },
                        { key: 'hard',   label: '🔴 Hard' },
                        { key: 'mixed',  label: '🎲 Mixed' },
                      ].map(d => (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setDifficulty(d.key)}
                          className={`diff-pill ${difficulty === d.key ? `active-${d.key}` : ''}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Generate button */}
            <Reveal delay={240}>
              <button type="submit" className="gen-btn" style={{ marginBottom: '40px' }}>
                <span className="gen-btn-inner">
                  <span>🚀</span>
                  <span>Generate {questionCount} Questions with AI</span>
                </span>
              </button>
            </Reveal>
          </form>
        )}

        {/* ══════════════ STEP 1: GENERATING ══════════════ */}
        {step === 1 && (
          <div className="glass-card generating-screen">
            <div className="generating-orb">🤖</div>
            <h2>Generating Questions...</h2>
            <p>AI is analyzing your content and crafting {questionCount} questions.<br />This usually takes 5–15 seconds.</p>
            <div className="generating-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* ══════════════ STEP 2: REVIEW ══════════════ */}
        {step === 2 && (
          <>
            {/* Stats */}
            <Reveal delay={0}>
              <div className="gen-stats-bar">
                <div className="gen-stat-card">
                  <div className="gen-stat-num" style={{ color: '#667eea' }}>{questions.length}</div>
                  <div className="gen-stat-label">Generated</div>
                </div>
                <div className="gen-stat-card">
                  <div className="gen-stat-num" style={{ color: '#10b981' }}>{publishedCount}</div>
                  <div className="gen-stat-label">Published</div>
                </div>
                <div className="gen-stat-card">
                  <div className="gen-stat-num" style={{ color: '#f59e0b' }}>{pendingCount}</div>
                  <div className="gen-stat-label">Pending</div>
                </div>
                <div className="gen-stat-card">
                  <div className="gen-stat-num" style={{ color: '#ef4444' }}>{rejectedCount}</div>
                  <div className="gen-stat-label">Rejected</div>
                </div>
              </div>
            </Reveal>

            {/* Bulk actions */}
            <Reveal delay={60}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                  onClick={handlePublishAll}
                  disabled={publishAllLoading || pendingCount === 0}
                  className={publishAllLoading ? 'loading' : ''}
                  style={{ flex: 1, minWidth: '180px', background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '14px', padding: '14px', fontWeight: '700', fontSize: '14px' }}
                >
                  {publishAllLoading ? '' : `✅ Publish All (${pendingCount})`}
                </button>
                <button
                  onClick={() => navigate(`/teacher/edit/${createdQuizId}`)}
                  style={{ flex: 1, minWidth: '180px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '14px', padding: '14px', fontWeight: '700', fontSize: '14px' }}
                >
                  ✏️ Edit Manually
                </button>
              </div>
            </Reveal>

            {/* Question cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {questions.map((q, i) => (
                <Reveal key={i} delay={i * 50}>
                  <div className={`q-review-card ${q.approved ? 'published' : q.rejected ? 'rejected' : ''}`}>

                    {editingIdx === i ? (
                      /* Edit mode */
                      <div>
                        <p style={{ fontWeight: '700', marginBottom: '12px', color: '#667eea' }}>✏️ Editing Q{i + 1}</p>
                        <textarea
                          value={editForm.questionText}
                          onChange={e => setEditForm({ ...editForm, questionText: e.target.value })}
                          rows={3}
                          className="premium-input"
                          style={{ marginBottom: '12px', resize: 'vertical' }}
                        />
                        {editForm.options.map((opt, oi) => (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <input type="radio" checked={editForm.correctIndex === oi} onChange={() => setEditForm({ ...editForm, correctIndex: oi })} />
                            <input
                              value={opt}
                              onChange={e => { const opts = [...editForm.options]; opts[oi] = e.target.value; setEditForm({ ...editForm, options: opts }); }}
                              className="premium-input"
                              style={{ flex: 1 }}
                            />
                          </div>
                        ))}
                        <textarea
                          placeholder="Explanation..."
                          value={editForm.explanation}
                          onChange={e => setEditForm({ ...editForm, explanation: e.target.value })}
                          rows={2}
                          className="premium-input"
                          style={{ marginTop: '8px', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          <button onClick={saveEdit} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '10px' }}>💾 Save</button>
                          <button onClick={() => setEditingIdx(null)} style={{ background: '#64748b', borderRadius: '10px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '800', color: '#94a3b8', fontSize: '13px' }}>Q{i + 1}</span>
                            {q.difficulty && (
                              <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', background: DIFF_COLORS[q.difficulty] + '20', color: DIFF_COLORS[q.difficulty], textTransform: 'capitalize' }}>
                                {q.difficulty}
                              </span>
                            )}
                            {q.topic && (
                              <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', background: '#ede9fe', color: '#7c3aed' }}>{q.topic}</span>
                            )}
                            {q.approved && <span style={{ color: '#10b981', fontWeight: '700', fontSize: '12px' }}>✅ Published</span>}
                            {q.rejected && <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '12px' }}>❌ Rejected</span>}
                          </div>

                          {!q.approved && !q.rejected && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => startEdit(i)} style={{ padding: '6px 12px', fontSize: '12px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '8px' }}>✏️</button>
                              <button
                                onClick={() => handlePublish(i)}
                                disabled={publishingSet.has(i)}
                                className={publishingSet.has(i) ? 'loading' : ''}
                                style={{ padding: '6px 14px', fontSize: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '8px', minWidth: '70px' }}
                              >
                                {publishingSet.has(i) ? '' : '✅ Publish'}
                              </button>
                              <button onClick={() => handleReject(i)} style={{ padding: '6px 10px', fontSize: '12px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: '8px' }}>✕</button>
                            </div>
                          )}
                        </div>

                        {/* Question text */}
                        <p style={{ fontWeight: '600', fontSize: '15px', lineHeight: '1.6', marginBottom: '14px', color: '#0f172a' }}>
                          {q.questionText}
                        </p>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`q-option ${oi === q.correctIndex ? 'correct' : ''}`}>
                              <div className="q-option-letter">
                                {oi === q.correctIndex ? '✓' : String.fromCharCode(65 + oi)}
                              </div>
                              {opt}
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div style={{ background: '#eff6ff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', color: '#1e40af', borderLeft: '3px solid #3b82f6', lineHeight: '1.5' }}>
                            💡 {q.explanation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* ══════════════ STEP 3: DONE ══════════════ */}
        {step === 3 && (
          <Reveal delay={0}>
            <div className="glass-card done-screen">
              <div className="done-checkmark">🎉</div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '10px', color: '#0f172a' }}>
                Quiz Published!
              </h2>
              <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px' }}>
                "{quizTitle}" is live with {publishedCount} questions ready for students.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/teacher')} style={{ background: '#f1f5f9', color: '#374151', borderRadius: '12px', padding: '12px 24px', fontWeight: '600' }}>
                  ← Dashboard
                </button>
                <button
                  onClick={() => navigate(`/teacher/edit/${createdQuizId}`)}
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '12px', padding: '12px 24px', fontWeight: '600' }}
                >
                  ✏️ Edit Quiz
                </button>
              </div>
            </div>
          </Reveal>
        )}

      </div>
    </div>
  );
}
