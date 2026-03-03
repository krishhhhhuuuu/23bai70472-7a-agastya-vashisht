import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <div 
      className="toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10000,
        animation: 'slideInRight 0.3s ease',
        minWidth: '300px',
        maxWidth: '500px',
        borderLeft: `4px solid ${colors[type]}`
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: colors[type],
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1, color: '#1e293b', fontSize: '14px' }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '20px',
          lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  );
}
