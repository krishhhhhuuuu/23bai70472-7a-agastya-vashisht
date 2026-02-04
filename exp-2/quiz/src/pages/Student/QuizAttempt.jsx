import { useParams, useNavigate } from "react-router-dom";
import { quizzes } from "../../data/dummyData";
import { useState } from "react";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const quiz = quizzes.find((q) => q.id === quizId);

  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({}); // Sure | NotSure | Guess

  if (!quiz) {
    return (
      <div className="container">
        <h2>Quiz Not Found</h2>
      </div>
    );
  }

  const handleSubmit = () => {
    let score = 0;

    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score++;
    });

    navigate("/result", {
      state: {
        quizTitle: quiz.title,
        score,
        total: quiz.questions.length,
        answers,
        confidence,
        questions: quiz.questions,
      },
    });
  };

  return (
    <div className="container">
      <h2>{quiz.title}</h2>
      <p className="badge">Topic: {quiz.topic}</p>

      {quiz.questions.map((q, index) => (
        <div key={q.id} className="card">
          <h4>
            Q{index + 1}. {q.text}
          </h4>

          {q.options.map((op, i) => (
            <label key={i}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === i}
                onChange={() => setAnswers({ ...answers, [q.id]: i })}
              />{" "}
              {op}
            </label>
          ))}

          <div style={{ marginTop: 10 }}>
            <p style={{ marginBottom: 5 }}>
              <b>Confidence:</b>
            </p>

            <div className="radioRow">
              {["Sure", "NotSure", "Guess"].map((c) => (
                <label key={c}>
                  <input
                    type="radio"
                    name={`conf-${q.id}`}
                    checked={confidence[q.id] === c}
                    onChange={() => setConfidence({ ...confidence, [q.id]: c })}
                  />{" "}
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
}
