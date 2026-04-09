import { useState, useRef } from 'react';
import { parseTextSyllabus, parseImageSyllabus, parseDocumentSyllabus, fileToBase64 } from '../services/syllabusService';

const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif';
const ACCEPT_DOCS   = '.pdf,.doc,.docx,.txt';

/**
 * SyllabusUploader
 * Props:
 *   subjectName  – string, used for AI context
 *   onParsed     – fn({ fullSyllabus, units, summary, rawText }) called after AI parse
 *   onRawText    – fn(text) called when user just wants raw text (no parse)
 *   compact      – bool, smaller layout for inline use
 */
export default function SyllabusUploader({ subjectName = 'Subject', onParsed, onRawText, compact = false }) {
  const [mode, setMode]         = useState('text'); // text | image | document
  const [text, setText]         = useState('');
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState('');
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef(null);
  const imgRef  = useRef(null);

  /* ── File drop / select ── */
  const handleFileDrop = (e, type) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!dropped) return;
    applyFile(dropped, type);
  };

  const applyFile = (f, type) => {
    setFile(f);
    setError('');
    if (type === 'image') {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  /* ── Parse ── */
  const handleParse = async () => {
    setError('');
    setLoading(true);
    setStatus('Sending to AI…');
    try {
      let result;
      if (mode === 'text') {
        if (!text.trim() || text.trim().length < 10) throw new Error('Please enter at least a few words of syllabus content.');
        setStatus('AI is organising your syllabus…');
        result = await parseTextSyllabus(text, subjectName);
      } else if (mode === 'image') {
        if (!file) throw new Error('Please select an image.');
        setStatus('Reading image with AI vision…');
        const b64 = await fileToBase64(file);
        result = await parseImageSyllabus(b64, file.type, subjectName);
      } else {
        if (!file) throw new Error('Please select a file.');
        setStatus('Extracting text from document…');
        result = await parseDocumentSyllabus(file, subjectName);
      }
      setStatus('Done!');
      onParsed?.(result);
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  /* ── Use raw text without parsing ── */
  const handleUseRaw = () => {
    if (!text.trim()) return;
    onRawText?.(text);
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: compact ? '8px 10px' : '10px 14px',
    borderRadius: '10px',
    border: '2px solid',
    borderColor: active ? '#667eea' : '#e2e8f0',
    background: active ? '#ede9fe' : 'white',
    color: active ? '#4f46e5' : '#64748b',
    fontWeight: '600',
    fontSize: compact ? '12px' : '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  const dropZoneStyle = (isDragging) => ({
    border: `2px dashed ${isDragging ? '#667eea' : '#cbd5e1'}`,
    borderRadius: '14px',
    padding: compact ? '24px 16px' : '36px 24px',
    textAlign: 'center',
    background: isDragging ? '#ede9fe' : '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="syllabus-uploader">
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button type="button" style={tabStyle(mode === 'text')}     onClick={() => { setMode('text');     setFile(null); setPreview(null); setError(''); }}>
          📝 Text / Paste
        </button>
        <button type="button" style={tabStyle(mode === 'image')}    onClick={() => { setMode('image');    setFile(null); setPreview(null); setError(''); }}>
          🖼️ Image
        </button>
        <button type="button" style={tabStyle(mode === 'document')} onClick={() => { setMode('document'); setFile(null); setPreview(null); setError(''); }}>
          📄 PDF / Doc
        </button>
      </div>

      {/* ── TEXT mode ── */}
      {mode === 'text' && (
        <div>
          <textarea
            placeholder={`Paste your syllabus here…\n\nExamples:\n• Full textbook chapter\n• Bullet-point notes\n• Topic list: "photosynthesis, cell division, DNA replication"`}
            value={text}
            onChange={e => setText(e.target.value)}
            rows={compact ? 5 : 8}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: '1.5px solid #e2e8f0', fontSize: '13px',
              fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.7',
              boxSizing: 'border-box', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          {onRawText && (
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              Use "Organise with AI" to auto-extract units, or "Use as-is" to paste directly.
            </p>
          )}
        </div>
      )}

      {/* ── IMAGE mode ── */}
      {mode === 'image' && (
        <div
          style={dropZoneStyle(dragging)}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => handleFileDrop(e, 'image')}
          onClick={() => imgRef.current?.click()}
        >
          <input
            ref={imgRef}
            type="file"
            accept={ACCEPT_IMAGES}
            style={{ display: 'none' }}
            onChange={e => applyFile(e.target.files[0], 'image')}
          />
          {preview ? (
            <div>
              <img src={preview} alt="preview" style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '10px', marginBottom: '10px' }} />
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{file?.name}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Click to change</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🖼️</div>
              <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Drop image here or click to browse</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>JPG, PNG, WebP — photos of handwritten or printed syllabi</p>
            </div>
          )}
        </div>
      )}

      {/* ── DOCUMENT mode ── */}
      {mode === 'document' && (
        <div
          style={dropZoneStyle(dragging)}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => handleFileDrop(e, 'document')}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_DOCS}
            style={{ display: 'none' }}
            onChange={e => applyFile(e.target.files[0], 'document')}
          />
          {file ? (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                {file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.txt') ? '📃' : '📘'}
              </div>
              <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>{file.name}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
              <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Drop file here or click to browse</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>PDF, DOCX, DOC, TXT — up to 10 MB</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fee2e2', borderRadius: '10px', fontSize: '13px', color: '#dc2626', borderLeft: '3px solid #ef4444' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Status */}
      {loading && status && (
        <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ede9fe', borderRadius: '10px', fontSize: '13px', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spinner-sm" />
          {status}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleParse}
          disabled={loading || (mode === 'text' ? !text.trim() : !file)}
          style={{
            flex: 1, minWidth: '160px',
            background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#667eea,#764ba2)',
            color: loading ? '#94a3b8' : 'white',
            borderRadius: '12px', padding: compact ? '10px 16px' : '12px 20px',
            fontWeight: '700', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {loading ? (
            <><span className="spinner-sm" /> Processing…</>
          ) : (
            <>✨ Organise with AI</>
          )}
        </button>

        {mode === 'text' && onRawText && (
          <button
            type="button"
            onClick={handleUseRaw}
            disabled={!text.trim()}
            style={{
              background: '#f1f5f9', color: '#374151',
              borderRadius: '12px', padding: compact ? '10px 16px' : '12px 20px',
              fontWeight: '600', fontSize: '13px', border: 'none', cursor: 'pointer',
            }}
          >
            Use as-is
          </button>
        )}
      </div>
    </div>
  );
}
