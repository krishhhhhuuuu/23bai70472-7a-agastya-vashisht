import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Cloud Quiz System (Phase-1)</h2>
      <p>Select login type:</p>

      <div className="row">
        <button onClick={() => navigate("/admin-login")}>Admin Login</button>
        <button onClick={() => navigate("/student-login")}>Student Login</button>
      </div>

      <p style={{ marginTop: 12 }}>
      </p>
    </div>
  );
}
