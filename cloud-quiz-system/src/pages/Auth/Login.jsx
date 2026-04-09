import { useState, useContext } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider, db } from "../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../../context/ToastContext";

// Demo accounts config
const DEMO_ACCOUNTS = {
  admin:   { email: 'admin@quiz.com',   password: 'admin123',   role: 'admin',   approved: true },
  teacher: { email: 'teacher@quiz.com', password: 'teacher123', role: 'teacher', approved: true },
  student: { email: 'student@quiz.com', password: 'student123', role: 'student', approved: true },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoLoading, setDemoLoading] = useState(null); // which demo button is loading
  const navigate = useNavigate();
  const { success, error, info, warning } = useContext(ToastContext);

  const redirectByRole = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    const role = userDoc.data()?.role;
    if (role === "admin") navigate("/admin");
    else if (role === "teacher") navigate("/teacher");
    else navigate("/student");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      redirectByRole(userCred.user.uid);
    } catch (err) {
      error(err.message, 4000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const existingUser = await getDoc(userRef);
      if (!existingUser.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: "student",
          approved: false,
          createdAt: Date.now(),
        });
      }
      redirectByRole(user.uid);
    } catch (err) {
      error(err.message, 4000);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      info("Enter your email first.", 3000);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      success("Password reset email sent!", 3000);
    } catch (err) {
      error(err.message, 4000);
    }
  };

  /**
   * One-click demo login:
   * 1. Try to sign in directly
   * 2. If account doesn't exist (invalid-credential), create it + Firestore doc, then sign in
   */
  const handleDemoLogin = async (role) => {
    const account = DEMO_ACCOUNTS[role];
    setDemoLoading(role);

    try {
      // Try signing in first
      const userCred = await signInWithEmailAndPassword(auth, account.email, account.password);

      // Make sure Firestore doc exists with correct role
      const userRef = doc(db, "users", userCred.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: account.email,
          role: account.role,
          approved: account.approved,
          createdAt: Date.now(),
        });
      }

      success(`Logged in as ${role}!`, 2000);
      redirectByRole(userCred.user.uid);

    } catch (err) {
      // Account doesn't exist yet — create it automatically
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        try {
          info(`Creating demo ${role} account...`, 2000);

          const newCred = await createUserWithEmailAndPassword(auth, account.email, account.password);

          // Save role to Firestore
          await setDoc(doc(db, "users", newCred.user.uid), {
            email: account.email,
            role: account.role,
            approved: account.approved,
            createdAt: Date.now(),
          });

          success(`Demo ${role} account created! Logging in...`, 2000);

          // Navigate based on role
          if (account.role === 'admin') navigate('/admin');
          else if (account.role === 'teacher') navigate('/teacher');
          else navigate('/student');

        } catch (createErr) {
          error('Failed to create demo account: ' + createErr.message, 5000);
        }
      } else {
        error(err.message, 4000);
      }
    } finally {
      setDemoLoading(null);
    }
  };

  const DEMO_BUTTONS = [
    { role: 'admin',   label: '👨‍💼 Admin',   desc: 'admin@quiz.com' },
    { role: 'teacher', label: '👨‍🏫 Teacher', desc: 'teacher@quiz.com' },
    { role: 'student', label: '👨‍🎓 Student', desc: 'student@quiz.com' },
  ];

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Cloud Quiz System</h2>

        {/* Demo login section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px',
          color: 'white',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', opacity: 0.9 }}>
            🎯 One-click demo login:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DEMO_BUTTONS.map(({ role, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoLogin(role)}
                disabled={demoLoading !== null}
                style={{
                  flex: '1',
                  minWidth: '90px',
                  padding: '10px 8px',
                  background: demoLoading === role ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: demoLoading !== null ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {demoLoading === role ? '⏳' : label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '11px', opacity: 0.75, margin: '10px 0 0', textAlign: 'center' }}>
            Accounts are created automatically on first use
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn">
            Sign In
          </button>
        </form>

        <div className="forgot-password">
          <span onClick={handleForgotPassword}>Forgot Password?</span>
        </div>

        <div className="divider">OR</div>

        <button onClick={handleGoogleLogin} className="google-btn">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" />
          Continue with Google
        </button>

        <p className="signup-link">
          Don't have an account?
          <span onClick={() => navigate("/signup")}> Sign Up</span>
        </p>
      </div>
    </div>
  );
}
