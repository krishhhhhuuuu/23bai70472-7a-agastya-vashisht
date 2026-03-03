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

  // 🔐 Block unapproved students
  if (role === "student" && approved === false) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Your account is pending admin approval.</h3>
        <p>Please wait until admin verifies your account.</p>
      </div>
    );
  }

  return children;
}