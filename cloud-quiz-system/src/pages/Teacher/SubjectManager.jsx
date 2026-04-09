import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubject, getTeacherSubjects, deleteSubject, addUnit, getUnits, updateUnit, deleteUnit } from '../../services/subjectService';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import SyllabusUploader from '../../components/SyllabusUploader';

const SUBJECT_COLORS = [
  { bg: 'linear-gradient(135deg,#667eea,#764ba2)', light: '#ede9fe' },
  { bg: 'linear-gradient(135deg,#10b981,#059669)', light: '#dcfce7' },
  { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fef9c3' },
  { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', light: '#fee2e2' },
  { bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', light: '#dbeafe' },
  { bg: 'linear-gradient(135deg,#ec4899,#db2777)', light: '#fce7f3' },
];

export default function SubjectManager() {
  const { currentUser } = useContext(AuthContext);
  const { success, error, warning } = useContext(ToastContext);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [units, setUnits] = useState([]);

  // Create subject form
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectColor, setSubjectColor] = useState(0);
  const [fullSyllabus, setFullSyllabus] = useState('');
  const [parsedUnitsPreview, setParsedUnitsPreview] = useState(null); // units from AI parse
  const [syllabusInputMode, setSyllabusInputMode] = useState('uploader'); // 'uploader' | 'manual'
  const [creatingSubject, setCreatingSubject] = useState(false);

  // Add unit form
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [unitContent, setUnitContent] = useState('');
  const [unitOrder, setUnitOrder] = useState(1);
  const [addingUnit, setAddingUnit] = useState(false);
  const [unitInputMode, setUnitInputMode] = useState('uploader'); // 'uploader' | 'manual'

  // Edit unit
  const [editingUnit, setEditingUnit] = useState(null);

  useEffect(() => { loadSubjects(); }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const data = await getTeacherSubjects(currentUser.uid);
    setSubjects(data);
    setLoading(false);
  };

  const loadUnits = async (subjectId) => {
    const data = await getUnits(subjectId);
    setUnits(data);
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    loadUnits(subject.id);
    setShowAddUnit(false);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setCreatingSubject(true);
    try {
      await createSubject({
        name: subjectName,
        description: subjectDesc,
        colorIndex: subjectColor,
        fullSyllabus,
        createdBy: currentUser.uid,
        units: parsedUnitsPreview || [],
      });

      if (parsedUnitsPreview?.length) {
        success(`Subject "${subjectName}" created with ${parsedUnitsPreview.length} AI-organised units!`, 4000);
      } else {
        success(`Subject "${subjectName}" created!`, 3000);
      }

      setSubjectName(''); setSubjectDesc(''); setFullSyllabus(''); setParsedUnitsPreview(null);
      setShowCreateSubject(false);
      loadSubjects();
    } catch (err) { error(err.message, 4000); }
    finally { setCreatingSubject(false); }
  };

  const handleDeleteSubject = async (subjectId, name) => {
    if (!window.confirm(`Delete subject "${name}"? This will delete all units.`)) return;
    try {
      await deleteSubject(subjectId);
      if (selectedSubject?.id === subjectId) setSelectedSubject(null);
      success('Subject deleted.', 2000);
      loadSubjects();
    } catch (err) { error(err.message, 4000); }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!unitName.trim() || !unitContent.trim()) { warning('Fill in unit name and content.', 3000); return; }
    setAddingUnit(true);
    try {
      await addUnit(selectedSubject.id, { name: unitName, content: unitContent, order: unitOrder });
      success(`Unit "${unitName}" added!`, 2000);
      setUnitName(''); setUnitContent(''); setUnitOrder(units.length + 2);
      setShowAddUnit(false);
      loadUnits(selectedSubject.id);
    } catch (err) { error(err.message, 4000); }
    finally { setAddingUnit(false); }
  };

  const handleDeleteUnit = async (unitId, name) => {
    if (!window.confirm(`Delete unit "${name}"?`)) return;
    try {
      await deleteUnit(selectedSubject.id, unitId);
      success('Unit deleted.', 2000);
      loadUnits(selectedSubject.id);
    } catch (err) { error(err.message, 4000); }
  };

  const handleSaveEditUnit = async () => {
    try {
      await updateUnit(selectedSubject.id, editingUnit.id, { name: editingUnit.name, content: editingUnit.content });
      success('Unit updated!', 2000);
      setEditingUnit(null);
      loadUnits(selectedSubject.id);
    } catch (err) { error(err.message, 4000); }
  };

  const goToGenerator = (mode, unit = null) => {
    navigate('/teacher/ai-generator', {
      state: {
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        fullSyllabus: selectedSubject.fullSyllabus,
        units,
        generateFrom: mode,
        selectedUnit: unit,
      }
    });
  };

  const color = (idx) => SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── LEFT: Subject list ── */}
      <div style={{
        width: '280px', flexShrink: 0,
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              My Subjects
            </span>
            <button
              onClick={() => setShowCreateSubject(true)}
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '5px 12px', fontSize: '12px', borderRadius: '8px', fontWeight: '700' }}
            >
              + New
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>Loading...</div>
          ) : subjects.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
              <p style={{ color: '#475569', fontSize: '13px' }}>No subjects yet</p>
              <button onClick={() => setShowCreateSubject(true)} style={{ marginTop: '12px', background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: '12px', padding: '8px 16px', borderRadius: '8px' }}>
                Create First Subject
              </button>
            </div>
          ) : subjects.map(s => (
            <div
              key={s.id}
              onClick={() => handleSelectSubject(s)}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '4px',
                background: selectedSubject?.id === s.id ? '#1e293b' : 'transparent',
                border: selectedSubject?.id === s.id ? '1px solid #334155' : '1px solid transparent',
                transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
              onMouseEnter={e => { if (selectedSubject?.id !== s.id) e.currentTarget.style.background = '#1e293b40'; }}
              onMouseLeave={e => { if (selectedSubject?.id !== s.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: color(s.colorIndex).bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
              }}>
                📚
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name}
                </div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                  {s.description || 'No description'}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteSubject(s.id, s.name); }}
                style={{ background: 'transparent', color: '#475569', padding: '4px', fontSize: '14px', borderRadius: '6px', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Subject detail ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
        {!selectedSubject ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📖</div>
            <h3 style={{ color: '#475569', marginBottom: '8px' }}>Select a subject</h3>
            <p style={{ fontSize: '14px' }}>or create a new one to get started</p>
          </div>
        ) : (
          <div style={{ padding: '28px', maxWidth: '900px' }}>

            {/* Subject header */}
            <div style={{
              background: color(selectedSubject.colorIndex).bg,
              borderRadius: '20px', padding: '28px 32px',
              marginBottom: '24px', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px',
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>{selectedSubject.name}</h2>
                <p style={{ opacity: 0.85, fontSize: '14px', margin: 0 }}>{selectedSubject.description || 'No description'}</p>
                <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '6px' }}>
                  {units.length} unit{units.length !== 1 ? 's' : ''} · {selectedSubject.fullSyllabus ? `${selectedSubject.fullSyllabus.length} chars of syllabus` : 'No full syllabus'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => goToGenerator('syllabus')}
                  style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '10px 18px', fontWeight: '700', fontSize: '13px' }}
                >
                  🤖 Generate from Full Syllabus
                </button>
                <button
                  onClick={() => goToGenerator('topic')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '10px', padding: '10px 18px', fontWeight: '600', fontSize: '13px' }}
                >
                  🎯 Generate from Topic
                </button>
              </div>
            </div>

            {/* Full syllabus preview */}
            {selectedSubject.fullSyllabus && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#0f172a' }}>📄 Full Syllabus</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{selectedSubject.fullSyllabus.length} characters</span>
                </div>
                <div style={{
                  background: '#f8fafc', borderRadius: '10px', padding: '14px',
                  fontSize: '13px', color: '#475569', lineHeight: '1.7',
                  maxHeight: '120px', overflow: 'hidden', position: 'relative',
                }}>
                  {selectedSubject.fullSyllabus.substring(0, 300)}...
                </div>
              </div>
            )}

            {/* Units section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                📑 Units / Chapters ({units.length})
              </h3>
              <button
                onClick={() => { setShowAddUnit(!showAddUnit); setUnitOrder(units.length + 1); }}
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '8px 18px', fontSize: '13px', borderRadius: '10px', fontWeight: '700' }}
              >
                + Add Unit
              </button>
            </div>

            {/* Add unit form */}
            {showAddUnit && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '2px solid #667eea30', boxShadow: '0 4px 20px rgba(102,126,234,0.1)' }}>
                <h4 style={{ marginBottom: '16px', color: '#667eea' }}>Add New Unit</h4>
                <form onSubmit={handleAddUnit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Unit Name *</label>
                      <input
                        placeholder="e.g., Unit 1: Introduction to Cells"
                        value={unitName}
                        onChange={e => setUnitName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Order</label>
                      <input
                        type="number" min="1"
                        value={unitOrder}
                        onChange={e => setUnitOrder(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Unit content — uploader or manual */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Unit Content *</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[['uploader','✨ Upload'], ['manual','✏️ Type']].map(([k, label]) => (
                          <button key={k} type="button"
                            onClick={() => setUnitInputMode(k)}
                            style={{
                              padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                              border: '1.5px solid', cursor: 'pointer',
                              borderColor: unitInputMode === k ? '#667eea' : '#e2e8f0',
                              background: unitInputMode === k ? '#ede9fe' : 'white',
                              color: unitInputMode === k ? '#4f46e5' : '#64748b',
                            }}
                          >{label}</button>
                        ))}
                      </div>
                    </div>

                    {unitInputMode === 'uploader' ? (
                      <SyllabusUploader
                        subjectName={unitName || selectedSubject?.name || 'Unit'}
                        compact
                        onParsed={(result) => {
                          // For a unit, use the full syllabus text as content
                          setUnitContent(result.fullSyllabus || result.extractedText || '');
                          // Auto-fill unit name from first unit if not set
                          if (!unitName && result.units?.[0]?.name) setUnitName(result.units[0].name);
                          success('Content extracted and ready!', 2000);
                        }}
                        onRawText={(t) => setUnitContent(t)}
                      />
                    ) : (
                      <textarea
                        placeholder="Paste the full content of this unit — notes, textbook chapter, bullet points..."
                        value={unitContent}
                        onChange={e => setUnitContent(e.target.value)}
                        rows={6}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }}
                        required
                      />
                    )}

                    {unitContent && (
                      <p style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>
                        ✓ {unitContent.length} characters ready
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={addingUnit || !unitContent.trim()} className={addingUnit ? 'loading' : ''} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', padding: '10px 24px', fontWeight: '700', minWidth: '120px' }}>
                      {addingUnit ? '' : '+ Add Unit'}
                    </button>
                    <button type="button" onClick={() => setShowAddUnit(false)} style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '10px', padding: '10px 20px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Units list */}
            {units.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📑</div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No units yet. Add your first unit above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {units.map((unit, i) => (
                  <div key={unit.id} style={{
                    background: 'white', borderRadius: '16px', padding: '20px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    {editingUnit?.id === unit.id ? (
                      <div>
                        <input
                          value={editingUnit.name}
                          onChange={e => setEditingUnit({ ...editingUnit, name: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #667eea', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' }}
                        />
                        <textarea
                          value={editingUnit.content}
                          onChange={e => setEditingUnit({ ...editingUnit, content: e.target.value })}
                          rows={5}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button onClick={handleSaveEditUnit} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '8px', padding: '8px 18px', fontSize: '13px' }}>💾 Save</button>
                          <button onClick={() => setEditingUnit(null)} style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '8px', padding: '8px 16px', fontSize: '13px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: color(selectedSubject.colorIndex).light,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: '800', color: '#374151',
                            }}>
                              {unit.order || i + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{unit.name}</h4>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{unit.content?.length || 0} chars</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => goToGenerator('unit', unit)}
                              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '6px 14px', fontSize: '12px', borderRadius: '8px', fontWeight: '700' }}
                            >
                              🤖 Generate Quiz
                            </button>
                            <button
                              onClick={() => setEditingUnit({ ...unit })}
                              style={{ background: '#f1f5f9', color: '#374151', padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.id, unit.name)}
                              style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 10px', fontSize: '12px', borderRadius: '8px' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div style={{
                          background: '#f8fafc', borderRadius: '8px', padding: '10px 14px',
                          fontSize: '13px', color: '#64748b', lineHeight: '1.6',
                          maxHeight: '80px', overflow: 'hidden',
                        }}>
                          {unit.content?.substring(0, 200)}...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Subject Modal ── */}
      {showCreateSubject && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
          animation: 'overlayFadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '32px',
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
            animation: 'modalSlideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Create New Subject</h3>
              <button onClick={() => setShowCreateSubject(false)} style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 12px', borderRadius: '8px', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleCreateSubject}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Subject Name *</label>
                <input
                  placeholder="e.g., Biology Class 10"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Description</label>
                <input
                  placeholder="e.g., CBSE Class 10 Biology"
                  value={subjectDesc}
                  onChange={e => setSubjectDesc(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {SUBJECT_COLORS.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setSubjectColor(i)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: c.bg, cursor: 'pointer',
                        border: subjectColor === i ? '3px solid #0f172a' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                        transform: subjectColor === i ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Syllabus Content
                </label>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                  Upload or paste your syllabus — AI will auto-extract units and topics.
                </p>

                {/* Toggle: uploader vs manual textarea */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {[['uploader','✨ Smart Upload'], ['manual','✏️ Manual Text']].map(([k, label]) => (
                    <button key={k} type="button"
                      onClick={() => setSyllabusInputMode(k)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
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
                    subjectName={subjectName || 'Subject'}
                    compact
                    onParsed={(result) => {
                      setFullSyllabus(result.fullSyllabus || '');
                      setParsedUnitsPreview(result.units || []);
                      success(`AI organised ${result.units?.length || 0} units from your syllabus!`, 3000);
                    }}
                    onRawText={(t) => { setFullSyllabus(t); setParsedUnitsPreview(null); }}
                  />
                ) : (
                  <textarea
                    placeholder="Paste your complete syllabus here..."
                    value={fullSyllabus}
                    onChange={e => setFullSyllabus(e.target.value)}
                    rows={6}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }}
                  />
                )}

                {/* Preview parsed units */}
                {parsedUnitsPreview?.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', marginBottom: '8px' }}>
                      ✅ AI found {parsedUnitsPreview.length} units — they'll be saved automatically:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {parsedUnitsPreview.slice(0, 5).map((u, i) => (
                        <div key={i} style={{ fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', minWidth: '18px' }}>{u.order}.</span>
                          <span>{u.name}</span>
                          {u.topics?.length > 0 && <span style={{ color: '#4ade80', fontSize: '11px' }}>({u.topics.length} topics)</span>}
                        </div>
                      ))}
                      {parsedUnitsPreview.length > 5 && (
                        <p style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px' }}>+{parsedUnitsPreview.length - 5} more units…</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={creatingSubject}
                  className={creatingSubject ? 'loading' : ''}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '12px', padding: '14px', fontWeight: '700', fontSize: '15px', minHeight: '48px' }}
                >
                  {creatingSubject ? '' : '✨ Create Subject'}
                </button>
                <button type="button" onClick={() => setShowCreateSubject(false)} style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '12px', padding: '14px 20px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
