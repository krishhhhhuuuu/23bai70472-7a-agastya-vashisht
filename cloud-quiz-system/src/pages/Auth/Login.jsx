import { useState, useContext } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider, db } from "../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { success, error, info } = useContext(ToastContext);

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
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
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

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@quiz.com');
      setPassword('admin123');
    } else if (role === 'teacher') {
      setEmail('teacher@quiz.com');
      setPassword('teacher123');
    } else if (role === 'student') {
      setEmail('student@quiz.com');
      setPassword('student123');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Cloud Quiz System</h2>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            🎯 Demo Credentials - Click to auto-fill:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              style={{
                flex: '1',
                minWidth: '100px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              👨‍💼 Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('teacher')}
              style={{
                flex: '1',
                minWidth: '100px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              👨‍🏫 Teacher
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              style={{
                flex: '1',
                minWidth: '100px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              👨‍🎓 Student
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            Sign In
          </button>
        </form>

        <div className="forgot-password">
          <span onClick={handleForgotPassword}>
            Forgot Password?
          </span>
        </div>

        <div className="divider">OR</div>

        <button onClick={handleGoogleLogin} className="google-btn">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
          />
          Continue with Google
        </button>

        <p className="signup-link">
          Don't have an account?
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
