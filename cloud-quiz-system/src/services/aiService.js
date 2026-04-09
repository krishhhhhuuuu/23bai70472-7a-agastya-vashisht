import { auth } from '../firebase/firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Get the current user's Firebase ID token for backend auth
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/**
 * Authenticated fetch wrapper
 */
async function apiFetch(path, options = {}) {
  const token = await getAuthToken();

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

/* ─────────────────────────────────────────────
   TEACHER: Generate MCQs from syllabus
───────────────────────────────────────────── */
export async function generateQuizFromSyllabus({ syllabusText, count, difficulty, topic, quizId, generateFrom, unitName, customTopic }) {
  return apiFetch('/api/ai/generate-quiz', {
    method: 'POST',
    body: JSON.stringify({ syllabusText, count, difficulty, topic, quizId, generateFrom, unitName, customTopic }),
  });
}

/* ─────────────────────────────────────────────
   TEACHER: Get pending draft questions
───────────────────────────────────────────── */
export async function getDraftQuestions(quizId) {
  return apiFetch(`/api/ai/drafts/${quizId}`);
}

/* ─────────────────────────────────────────────
   TEACHER: Publish ALL draft questions in one request
───────────────────────────────────────────── */
export async function publishAllDraftQuestions(quizId, questions) {
  // questions: [{ draftId, edits? }]
  return apiFetch('/api/ai/publish-all', {
    method: 'POST',
    body: JSON.stringify({ quizId, questions }),
  });
}

/* ─────────────────────────────────────────────
   TEACHER: Publish a draft question (with optional edits)
───────────────────────────────────────────── */
export async function publishDraftQuestion(quizId, draftId, edits = null) {
  return apiFetch('/api/ai/publish-question', {
    method: 'POST',
    body: JSON.stringify({ quizId, draftId, edits }),
  });
}

/* ─────────────────────────────────────────────
   TEACHER: Reject a draft question
───────────────────────────────────────────── */
export async function rejectDraftQuestion(quizId, draftId) {
  return apiFetch('/api/ai/reject-question', {
    method: 'DELETE',
    body: JSON.stringify({ quizId, draftId }),
  });
}

/* ─────────────────────────────────────────────
   STUDENT: Ask AI tutor
───────────────────────────────────────────── */
export async function askAITutor({ question, studentAnswer, correctAnswer, explanation, userQuery }) {
  return apiFetch('/api/ai/tutor', {
    method: 'POST',
    body: JSON.stringify({ question, studentAnswer, correctAnswer, explanation, userQuery }),
  });
}

/* ─────────────────────────────────────────────
   STUDENT: Get adaptive difficulty for next question
───────────────────────────────────────────── */
export async function getAdaptiveDifficulty({ correctCount, totalCount, currentDifficulty }) {
  return apiFetch('/api/ai/adaptive-next', {
    method: 'POST',
    body: JSON.stringify({ correctCount, totalCount, currentDifficulty }),
  });
}
