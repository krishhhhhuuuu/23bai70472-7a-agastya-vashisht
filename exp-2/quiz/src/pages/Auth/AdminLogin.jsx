import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../data/authData";
import { setCurrentUser } from "../../utils/localAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === ADMIN.email && password === ADMIN.password) {
      setCurrentUser({ role: "admin", email });
      navigate("/admin");
    } else {
      alert("Invalid Admin Credentials ❌");
    }
  };

  return (
    <div className="container">
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@gmail.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="admin123"
        />

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: 10 }} className="badge">
        Demo Admin: admin@gmail.com / admin123
      </p>
    </div>
  );
}
