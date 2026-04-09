import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  if (!state) {
    return (
      <div className="container">
        <h2>No Result Found</h2>
        <button onClick={() => navigate("/student")}>Go Back</button>
      </div>
    );
  }

  const { quizTitle, score, total, answers, confidence, questions } = state;

  let correctSure = 0;
  let correctGuess = 0;
  let wrongSure = 0;
  let wrongGuess = 0;

  questions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correctIndex;
    const conf = confidence[q.id];

    if (isCorrect && conf === "Sure") correctSure++;
    else if (isCorrect && conf === "Guess") correctGuess++;
    else if (!isCorrect && conf === "Sure") wrongSure++;
    else if (!isCorrect && conf === "Guess") wrongGuess++;
  });

  return (
    <div className="container">
      <h2>Result: {quizTitle}</h2>

      <h3>
        Score: {score} / {total}
      </h3>

      <div className="card">
        <h4>Smart Review (Confidence Analysis)</h4>
        <p>✅ Correct & Sure: {correctSure}</p>
        <p>✅ Correct but Guess: {correctGuess}</p>
        <p>❌ Wrong but Sure (Concept Gap): {wrongSure}</p>
        <p>❌ Wrong & Guess: {wrongGuess}</p>
      </div>

      <button onClick={() => navigate("/student")}>Back to Dashboard</button>
    </div>
  );
}
