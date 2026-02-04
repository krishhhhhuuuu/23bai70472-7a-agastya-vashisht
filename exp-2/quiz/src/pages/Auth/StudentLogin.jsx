import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findStudent, setCurrentUser } from "../../utils/localAuth";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const student = findStudent(email, password);

    if (student) {
      setCurrentUser({ role: "student", email, name: student.name });
      navigate("/student");
    } else {
      alert("Student not found ❌\nAsk Admin to add you first.");
    }
  };

  return (
    <div className="container">
      <h2>Student Login</h2>

      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@gmail.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: 10 }}>
        Student accounts are created by Admin (Phase-1 local).
      </p>
    </div>
  );
}
