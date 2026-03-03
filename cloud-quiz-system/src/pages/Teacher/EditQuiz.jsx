import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getQuizById, 
  getQuizQuestions, 
  updateQuiz, 
  deleteQuiz,
  addQuestionToQuiz,
  updateQuestion,
  deleteQuestion 
} from "../../services/quizService";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import Navbar from "../../components/Navbar";

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { success, error, warning } = useContext(ToastContext);

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz edit states
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");

  // Question edit states
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(null);

  // Add new question states
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const quizData = await getQuizById(quizId);
      
      if (!quizData || quizData.createdBy !== currentUser.uid) {
        error("Unauthorized access", 3000);
        navigate("/teacher");
        return;
      }

      const questionsData = await getQuizQuestions(quizId);

      setQuiz(quizData);
      setTitle(quizData.title);
      setTopic(quizData.topic);
      setDuration(quizData.duration);
      setQuestions(questionsData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading quiz:", err);
      error("Error loading quiz", 3000);
      navigate("/teacher");
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      await updateQuiz(quizId, { title, topic, duration: Number(duration) });
      success("Quiz updated successfully!", 3000);
      loadQuiz();
    } catch (err) {
      error("Error updating quiz: " + err.message, 4000);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm("Are you sure you want to delete this quiz? This will delete all questions and cannot be undone.")) {
      return;
    }

    try {
      await deleteQuiz(quizId);
      success("Quiz deleted successfully!", 3000);
      setTimeout(() => navigate("/teacher"), 1000);
    } catch (err) {
      error("Error deleting quiz: " + err.message, 4000);
    }
  };

  const startEditQuestion = (question) => {
    setEditingQuestion(question.id);
    setQuestionText(question.questionText);
    setOptions(question.options);
    setCorrectIndex(question.correctIndex);
  };

  const cancelEditQuestion = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
  };

  const handleUpdateQuestion = async (questionId) => {
    try {
      await updateQuestion(quizId, questionId, {
        questionText,
        options,
        correctIndex: Number(correctIndex),
      });
      success("Question updated successfully!", 3000);
      cancelEditQuestion();
      loadQuiz();
    } catch (err) {
      error("Error updating question: " + err.message, 4000);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(quizId, questionId);
      success("Question deleted successfully!", 3000);
      loadQuiz();
    } catch (err) {
      error("Error deleting question: " + err.message, 4000);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addQuestionToQuiz(quizId, {
        questionText: newQuestionText,
        options: newOptions,
        correctIndex: Number(newCorrectIndex),
      });
      success("Question added successfully!", 3000);
      setShowAddQuestion(false);
      setNewQuestionText("");
      setNewOptions(["", "", "", ""]);
      setNewCorrectIndex(null);
      loadQuiz();
    } catch (err) {
      error("Error adding question: " + err.message, 4000);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
          <h2>Edit Quiz</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate("/teacher")}>← Back</button>
            <button 
              onClick={handleDeleteQuiz}
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              🗑️ Delete Quiz
            </button>
          </div>
        </div>

        {/* Edit Quiz Details */}
        <div className="card">
          <h3>Quiz Details</h3>
          <form onSubmit={handleUpdateQuiz}>
            <input
              placeholder="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              required
            />
            <button type="submit">💾 Update Quiz Details</button>
          </form>
        </div>

        {/* Questions List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Questions ({questions.length})</h3>
            <button 
              onClick={() => setShowAddQuestion(!showAddQuestion)}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              {showAddQuestion ? '✕ Cancel' : '+ Add Question'}
            </button>
          </div>

          {/* Add New Question Form */}
          {showAddQuestion && (
            <div className="question-edit-form">
              <h4>Add New Question</h4>
              <form onSubmit={handleAddQuestion}>
                <input
                  placeholder="Question Text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {newOptions.map((opt, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[index] = e.target.value;
                          setNewOptions(updated);
                        }}
                        required
                        style={{ flex: 1 }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <input
                          type="radio"
                          name="newCorrect"
                          checked={newCorrectIndex === index}
                          onChange={() => setNewCorrectIndex(index)}
                          required
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
                <button type="submit" style={{ marginTop: '12px' }}>Add Question</button>
              </form>
            </div>
          )}

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="empty-state">
              <h3>No questions yet</h3>
              <p>Add questions to this quiz</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {questions.map((q, index) => (
                <div key={q.id} className="question-card">
                  {editingQuestion === q.id ? (
                    // Edit Mode
                    <div className="question-edit-form">
                      <h4>Editing Question {index + 1}</h4>
                      <input
                        placeholder="Question Text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        {options.map((opt, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                              placeholder={`Option ${i + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...options];
                                updated[i] = e.target.value;
                                setOptions(updated);
                              }}
                              style={{ flex: 1 }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                              <input
                                type="radio"
                                name="editCorrect"
                                checked={correctIndex === i}
                                onChange={() => setCorrectIndex(i)}
                              />
                              Correct
                            </label>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button onClick={() => handleUpdateQuestion(q.id)}>💾 Save</button>
                        <button onClick={cancelEditQuestion} style={{ background: '#64748b' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <span className="question-number">Question {index + 1}</span>
                          <h4 className="question-text">{q.questionText}</h4>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => startEditQuestion(q)}
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '13px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="options-list">
                        {q.options.map((opt, i) => (
                          <div 
                            key={i} 
                            className={`option-item ${i === q.correctIndex ? 'selected' : ''}`}
                            style={{ cursor: 'default' }}
                          >
                            <span style={{ marginRight: '12px' }}>
                              {i === q.correctIndex ? '✓' : '○'}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
