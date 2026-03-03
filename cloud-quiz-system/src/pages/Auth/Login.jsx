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

  // 🔐 Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      warning("Enter your email first.", 3000);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      success("Password reset email sent!", 3000);
    } catch (err) {
      error(err.message, 4000);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Cloud Quiz System</h2>

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

        {/* 🔐 Forgot Password Button */}
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
          Don’t have an account?
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}