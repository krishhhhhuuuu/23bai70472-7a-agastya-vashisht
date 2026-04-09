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

/* ─────────────────────────────────────────────
   Parse plain text syllabus
───────────────────────────────────────────── */
export async function parseTextSyllabus(text, subjectName) {
  return apiFetch('/api/syllabus/parse-text', {
    method: 'POST',
    body: JSON.stringify({ text, subjectName }),
  });
}

/* ─────────────────────────────────────────────
   Parse image syllabus (base64)
───────────────────────────────────────────── */
export async function parseImageSyllabus(imageBase64, mimeType, subjectName) {
  return apiFetch('/api/syllabus/parse-image', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, mimeType, subjectName }),
  });
}

/* ─────────────────────────────────────────────
   Parse document (PDF/DOCX/TXT)
───────────────────────────────────────────── */
export async function parseDocumentSyllabus(file, subjectName) {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subjectName', subjectName);

  const res = await fetch(`${BACKEND_URL}/api/syllabus/parse-document`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/* ─────────────────────────────────────────────
   Convert file to base64 (for images)
───────────────────────────────────────────── */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
