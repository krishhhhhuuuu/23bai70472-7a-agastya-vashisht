import { useState, useContext, useEffect } from "react";
import { createQuiz, addQuestionToQuiz, getAllQuizzes, getQuizAttempts } from "../../services/quizService";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const { currentUser } = useContext(AuthContext);
  const { success, error, info, warning } = useContext(ToastContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    const data = await getAllQuizzes();
    const teacherQuizzes = data.filter(
      (quiz) => quiz.createdBy === currentUser.uid
    );
    setQuizzes(teacherQuizzes);
  };

  // Debug function to check attempts
  const checkAttempts = async () => {
    try {
      const allAttempts = await getQuizAttempts();
      console.log("All attempts in database:", allAttempts);
      info(`Found ${allAttempts.length} total attempts in database. Check console for details.`, 5000);
    } catch (err) {
      console.error("Error checking attempts:", err);
      error("Error: " + err.message, 4000);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    const quizId = await createQuiz({
      title,
      topic,
      duration: Number(duration),
      createdBy: currentUser.uid,
    });

    setQuizzes([...quizzes, {
      id: quizId,
      title,
      topic,
      duration
    }]);

    setTitle("");
    setTopic("");
    setDuration("");
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!selectedQuiz) {
      warning("Select quiz first", 3000);
      return;
    }

    await addQuestionToQuiz(selectedQuiz, {
      questionText,
      options,
      correctIndex: Number(correctIndex)
    });

    success("Question Added!", 3000);

    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Teacher Dashboard</h2>

        {/* View All Reports Button */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => navigate("/teacher/reports")}
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '12px 24px',
              fontSize: '15px'
            }}
          >
            📊 View All Student Reports
          </button>
        </div>

        <div className="card">
          <h3>Create New Quiz</h3>

          <form onSubmit={handleCreateQuiz}>
            <input 
              placeholder="Quiz Title" 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)}
              required
            />
            
            <input 
              placeholder="Topic (e.g., Mathematics, Science)" 
              value={topic} 
              onChange={(e)=>setTopic(e.target.value)}
              required
            />
            
            <input 
              type="number" 
              placeholder="Duration (minutes)" 
              value={duration} 
              onChange={(e)=>setDuration(e.target.value)}
              min="1"
              required
            />
            
            <button type="submit">Create Quiz</button>
          </form>
        </div>

        <div className="card">
          <h3>Add Questions to Quiz</h3>

          <select 
            value={selectedQuiz} 
            onChange={(e)=>setSelectedQuiz(e.target.value)}
            style={{ marginBottom: '20px' }}
          >
            <option value="">-- Select a Quiz --</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>

          {selectedQuiz && (
            <form onSubmit={handleAddQuestion}>
              <input
                placeholder="Question Text"
                value={questionText}
                onChange={(e)=>setQuestionText(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {options.map((opt, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      required
                      style={{ flex: 1 }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <input
                        type="radio"
                        name="correct"
                        checked={correctIndex === index}
                        onChange={() => setCorrectIndex(index)}
                        required
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>

              <button type="submit">Add Question</button>
            </form>
          )}
        </div>

        {quizzes.length > 0 && (
          <div className="card">
            <h3>Your Quizzes</h3>
            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card" style={{ cursor: 'default' }}>
                  <h3>{quiz.title}</h3>
                  <div className="quiz-meta">
                    <div className="quiz-meta-item">📚 {quiz.topic}</div>
                    <div className="quiz-meta-item">⏱️ {quiz.duration} minutes</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      onClick={() => navigate(`/teacher/edit/${quiz.id}`)}
                      style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => navigate(`/teacher/analytics/${quiz.id}`)}
                      style={{ flex: 1 }}
                    >
                      📊 Analytics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}