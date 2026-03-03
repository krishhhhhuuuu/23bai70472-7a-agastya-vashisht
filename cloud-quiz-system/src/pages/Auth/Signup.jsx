import { useState, useContext } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../../context/ToastContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { success, error } = useContext(ToastContext);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🔐 Default student + not approved
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role: "student",
        approved: false,
        createdAt: Date.now(),
      });

      success("Account created! Wait for admin approval.", 4000);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      error(err.message, 4000);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSignup} className="login-form">
          <input
            type="email"
            placeholder="Email"
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}