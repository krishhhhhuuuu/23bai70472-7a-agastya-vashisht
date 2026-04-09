import { quizzes } from "../../data/dummyData";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Student Dashboard</h2>
      <p>Select any quiz to start:</p>

      {quizzes.map((q) => (
        <div key={q.id} className="card">
          <h3>{q.title}</h3>
          <p className="badge">Topic: {q.topic}</p>
          <p>Time: {q.durationMinutes} minutes</p>

          <button onClick={() => navigate(`/quiz/${q.id}`)}>Start Quiz</button>
        </div>
      ))}
    </div>
  );
}
