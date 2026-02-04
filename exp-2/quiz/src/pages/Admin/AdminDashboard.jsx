import { useState } from "react";
import { quizzes } from "../../data/dummyData";
import { addStudent, getStudents } from "../../utils/localAuth";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [students, setStudents] = useState(getStudents());

  const handleAddStudent = (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Fill all fields ❌");
      return;
    }

    const success = addStudent({ name, email, password });

    if (!success) {
      alert("Student with this email already exists ❌");
      return;
    }

    alert("Student added successfully ✅");

    setName("");
    setEmail("");
    setPassword("");

    setStudents(getStudents());
  };

  return (
    <div className="container">
      <h2>Admin Dashboard (Phase-1)</h2>
      <p className="badge">
        Admin can add students locally (LocalStorage)
      </p>

      {/* ✅ Add Student Form */}
      <div className="card">
        <h3>Add Student</h3>

        <form onSubmit={handleAddStudent}>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student name"
          />

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
            placeholder="student password"
          />

          <button type="submit">Add Student</button>
        </form>
      </div>

      {/* ✅ Student List */}
      <div className="card">
        <h3>Student List</h3>
        {students.length === 0 ? (
          <p>No students added yet.</p>
        ) : (
          students.map((s, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <b>{s.name}</b>
              <p style={{ margin: 0 }}>{s.email}</p>
            </div>
          ))
        )}
      </div>

      {/* ✅ Quiz List */}
      <div className="card">
        <h3>Available Quizzes (Demo)</h3>
        {quizzes.map((q) => (
          <div key={q.id} style={{ marginBottom: 12 }}>
            <b>{q.title}</b>
            <p style={{ margin: 0 }}>Topic: {q.topic}</p>
            <p style={{ margin: 0 }}>Questions: {q.questions.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
