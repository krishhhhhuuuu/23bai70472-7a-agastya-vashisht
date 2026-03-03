import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar() {
  const { role } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">

        {/* LEFT - Logo */}
        <div className="nav-logo" onClick={() => navigate("/")}>
          CloudQuiz
        </div>

        {/* CENTER - Links */}
        <div className="nav-links">
          {role === "admin" && (
            <span onClick={() => navigate("/admin")}>
              Dashboard
            </span>
          )}

          {role === "teacher" && (
            <span onClick={() => navigate("/teacher")}>
              Dashboard
            </span>
          )}

          {role === "student" && (
            <span onClick={() => navigate("/student")}>
              Dashboard
            </span>
          )}
        </div>

        {/* RIGHT - Dark Mode + Role + Logout */}
        <div className="nav-right">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="dark-mode-toggle"
            data-tooltip={darkMode ? "Light Mode" : "Dark Mode"}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <span className="role-badge">
            {role?.toUpperCase()}
          </span>

          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

      </div>
    </header>
  );
}