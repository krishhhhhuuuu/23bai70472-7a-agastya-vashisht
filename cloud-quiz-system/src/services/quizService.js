import {
  collection, addDoc, getDocs, doc, getDoc,
  query, where, updateDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const createQuiz = async (quizData) => {
  const ref = await addDoc(collection(db, "quizzes"), { ...quizData, createdAt: Date.now() });
  return ref.id;
};

export const addQuestionToQuiz = async (quizId, questionData) => {
  if (!quizId) throw new Error("Quiz ID missing");
  await addDoc(collection(db, "quizzes", quizId, "questions"), { ...questionData, createdAt: Date.now() });
};

export const getAllQuizzes = async () => {
  const snap = await getDocs(collection(db, "quizzes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getQuizById = async (quizId) => {
  const snap = await getDoc(doc(db, "quizzes", quizId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getQuizQuestions = async (quizId) => {
  const snap = await getDocs(collection(db, "quizzes", quizId, "questions"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getQuizAttempts = async (quizId) => {
  try {
    if (quizId) {
      const q = query(collection(db, "attempts"), where("quizId", "==", quizId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    const snap = await getDocs(collection(db, "attempts"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error getting quiz attempts:", err);
    return [];
  }
};

export const getAttemptsByTeacher = async (teacherId) => {
  try {
    const quizzes = await getAllQuizzes();
    const ids = quizzes.filter(q => q.createdBy === teacherId).map(q => q.id);
    if (!ids.length) return [];
    const all = await getQuizAttempts();
    return all.filter(a => ids.includes(a.quizId));
  } catch (err) {
    console.error("Error getting attempts by teacher:", err);
    return [];
  }
};

export const updateQuiz = async (quizId, quizData) => {
  await updateDoc(doc(db, "quizzes", quizId), { ...quizData, updatedAt: Date.now() });
  return true;
};

export const deleteQuiz = async (quizId) => {
  const snap = await getDocs(collection(db, "quizzes", quizId, "questions"));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "quizzes", quizId));
  return true;
};

export const deleteAllQuizzesByTeacher = async (teacherId) => {
  const all = await getAllQuizzes();
  const mine = all.filter(q => q.createdBy === teacherId);
  await Promise.all(mine.map(q => deleteQuiz(q.id)));
  return mine.length;
};

export const deleteQuestion = async (quizId, questionId) => {
  await deleteDoc(doc(db, "quizzes", quizId, "questions", questionId));
  return true;
};

export const updateQuestion = async (quizId, questionId, questionData) => {
  await updateDoc(doc(db, "quizzes", quizId, "questions", questionId), { ...questionData, updatedAt: Date.now() });
  return true;
};
