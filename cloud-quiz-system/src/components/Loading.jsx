/* Loading component with skeleton screens and spinner variants */

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      <div style={{ marginTop: '16px' }}>
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export function SkeletonQuizGrid({ count = 3 }) {
  return (
    <div className="quiz-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: '24px' }}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: '70%' }} />
          <div className="skeleton skeleton-text" style={{ width: '50%' }} />
          <div style={{ marginTop: '16px' }}>
            <div className="skeleton skeleton-btn" style={{ width: '100%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <div className="skeleton skeleton-title" style={{ width: '40%', height: '36px', marginBottom: '24px' }} />
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ flex: '1', minWidth: '120px', height: '90px', borderRadius: '16px' }} />
        ))}
      </div>
      <SkeletonQuizGrid count={3} />
    </div>
  );
}

export default function Loading({ fullScreen = false, message = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        flexDirection: 'column', gap: '20px',
      }}>
        <div style={{
          width: '56px', height: '56px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', opacity: 0.9 }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#64748b', fontSize: '14px' }}>{message}</p>
    </div>
  );
}
