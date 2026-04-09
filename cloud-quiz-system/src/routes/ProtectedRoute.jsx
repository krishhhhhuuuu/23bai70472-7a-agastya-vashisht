import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, role, approved } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" />;
  }

  // 🔐 Block unapproved students with better UI
  if (role === "student" && approved === false) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ 
            color: '#1e293b', 
            marginBottom: '16px',
            fontSize: '28px'
          }}>
            Approval Pending
          </h2>
          <p style={{ 
            color: '#64748b', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Your account is waiting for admin approval. You'll be able to access the quiz system once an administrator verifies your account.
          </p>
          <div style={{
            background: '#f1f5f9',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ 
              color: '#475569', 
              fontSize: '14px',
              margin: 0
            }}>
              <strong>What's next?</strong><br/>
              Check back later or contact your administrator for faster approval.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
}
