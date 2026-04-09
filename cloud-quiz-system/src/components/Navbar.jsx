import { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar() {
  const { role, currentUser } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Add shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(auth);
    navigate("/");
  };

  const roleConfig = {
    admin:   { label: 'Admin',   color: '#ef4444', home: '/admin' },
    teacher: { label: 'Teacher', color: '#f59e0b', home: '/teacher' },
    student: { label: 'Student', color: '#10b981', home: '/student' },
  };

  const config = roleConfig[role] || {};

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">

        {/* Logo */}
        <div
          className="nav-logo"
          onClick={() => navigate(config.home || '/')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '20px', marginRight: '6px' }}>⚡</span>
          CloudQuiz
        </div>

        {/* Nav links */}
        <div className="nav-links">
          {role && (
            <span
              onClick={() => navigate(config.home)}
              style={{
                fontWeight: location.pathname === config.home ? '700' : '500',
                borderBottom: location.pathname === config.home ? '2px solid white' : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              Dashboard
            </span>
          )}
          {role === 'teacher' && (
            <span
              onClick={() => navigate('/teacher/ai-generator')}
              style={{
                fontWeight: location.pathname === '/teacher/ai-generator' ? '700' : '500',
                borderBottom: location.pathname === '/teacher/ai-generator' ? '2px solid white' : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              🤖 AI Generator
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '7px 10px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Role badge */}
          {role && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              background: config.color + '25',
              color: 'white',
              border: `1px solid ${config.color}60`,
              letterSpacing: '0.5px',
            }}>
              {config.label}
            </span>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={loggingOut ? 'loading' : ''}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
            }}
            onMouseEnter={e => !loggingOut && (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            {loggingOut ? '' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header>
  );
}
