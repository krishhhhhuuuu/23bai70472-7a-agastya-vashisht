import { auth } from '../firebase/firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

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
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/* ── Get teacher's subjects ── */
export const getTeacherSubjects = async (_teacherId) => {
  const data = await apiFetch('/api/subjects');
  return data.subjects || [];
};

/* ── Create subject (+ optional AI-parsed units in one call) ── */
export const createSubject = async ({ name, description, colorIndex, fullSyllabus, createdBy, units = [] }) => {
  const data = await apiFetch('/api/subjects', {
    method: 'POST',
    body: JSON.stringify({ name, description, colorIndex, fullSyllabus, units }),
  });
  return data.subjectId;
};

/* ── Delete subject ── */
export const deleteSubject = async (subjectId) => {
  await apiFetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
};

/* ── Get units of subject ── */
export const getUnits = async (subjectId) => {
  const data = await apiFetch(`/api/subjects/${subjectId}/units`);
  return data.units || [];
};

/* ── Add unit to subject ── */
export const addUnit = async (subjectId, unitData) => {
  const data = await apiFetch(`/api/subjects/${subjectId}/units`, {
    method: 'POST',
    body: JSON.stringify(unitData),
  });
  return data.unitId;
};

/* ── Update unit ── */
export const updateUnit = async (subjectId, unitId, unitData) => {
  await apiFetch(`/api/subjects/${subjectId}/units/${unitId}`, {
    method: 'PUT',
    body: JSON.stringify(unitData),
  });
};

/* ── Delete unit ── */
export const deleteUnit = async (subjectId, unitId) => {
  await apiFetch(`/api/subjects/${subjectId}/units/${unitId}`, { method: 'DELETE' });
};

/* ── Get ALL subjects (for students) ── */
export const getAllSubjects = async () => {
  const data = await apiFetch('/api/subjects/all');
  return data.subjects || [];
};

/* ── Get subject detail + units + quizzes (for students) ── */
export const getSubjectDetail = async (subjectId) => {
  const data = await apiFetch(`/api/subjects/${subjectId}/detail`);
  return data; // { subject, units, quizzes }
};
