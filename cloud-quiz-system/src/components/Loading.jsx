export default function Loading({ fullScreen = false, message = "Loading..." }) {
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: 'white', marginTop: '20px', fontSize: '16px' }}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
