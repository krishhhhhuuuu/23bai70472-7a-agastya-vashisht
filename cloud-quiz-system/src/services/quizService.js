import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/* =========================
   CREATE QUIZ
========================= */
export const createQuiz = async (quizData) => {
  const docRef = await addDoc(collection(db, "quizzes"), {
    ...quizData,
    createdAt: Date.now(),
  });

  return docRef.id;
};

/* =========================
   ADD QUESTION TO QUIZ
========================= */
export const addQuestionToQuiz = async (quizId, questionData) => {
  if (!quizId) throw new Error("Quiz ID missing");

  await addDoc(
    collection(db, "quizzes", quizId, "questions"),
    {
      ...questionData,
      createdAt: Date.now(),
    }
  );
};

/* =========================
   GET ALL QUIZZES
========================= */
export const getAllQuizzes = async () => {
  const snapshot = await getDocs(collection(db, "quizzes"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* =========================
   GET SINGLE QUIZ
========================= */
export const getQuizById = async (quizId) => {
  const quizRef = doc(db, "quizzes", quizId);
  const quizSnap = await getDoc(quizRef);

  if (!quizSnap.exists()) return null;

  return { id: quizSnap.id, ...quizSnap.data() };
};

/* =========================
   GET QUESTIONS OF QUIZ
========================= */
export const getQuizQuestions = async (quizId) => {
  const snapshot = await getDocs(
    collection(db, "quizzes", quizId, "questions")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};


/* =========================
   GET QUIZ ATTEMPTS
========================= */
export const getQuizAttempts = async (quizId) => {
  try {
    if (quizId) {
      // Query for specific quiz
      const q = query(
        collection(db, "attempts"),
        where("quizId", "==", quizId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } else {
      // Get all attempts
      const snapshot = await getDocs(collection(db, "attempts"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
  } catch (error) {
    console.error("Error getting quiz attempts:", error);
    return [];
  }
};

/* =========================
   GET ALL ATTEMPTS BY TEACHER
========================= */
export const getAttemptsByTeacher = async (teacherId) => {
  try {
    console.log("Getting attempts for teacher:", teacherId);
    
    const quizzes = await getAllQuizzes();
    console.log("All quizzes:", quizzes);
    
    const teacherQuizzes = quizzes.filter(quiz => quiz.createdBy === teacherId);
    console.log("Teacher quizzes:", teacherQuizzes);
    
    const teacherQuizIds = teacherQuizzes.map(quiz => quiz.id);
    console.log("Teacher quiz IDs:", teacherQuizIds);

    if (teacherQuizIds.length === 0) {
      console.log("No quizzes found for teacher");
      return [];
    }

    const allAttempts = await getQuizAttempts();
    console.log("All attempts:", allAttempts);
    
    const filteredAttempts = allAttempts.filter(attempt => teacherQuizIds.includes(attempt.quizId));
    console.log("Filtered attempts:", filteredAttempts);
    
    return filteredAttempts;
  } catch (error) {
    console.error("Error getting attempts by teacher:", error);
    return [];
  }
};


/* =========================
   UPDATE QUIZ
========================= */
export const updateQuiz = async (quizId, quizData) => {
  try {
    const quizRef = doc(db, "quizzes", quizId);
    await updateDoc(quizRef, {
      ...quizData,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

/* =========================
   DELETE QUIZ
========================= */
export const deleteQuiz = async (quizId) => {
  try {
    // Delete all questions in the quiz
    const questionsSnapshot = await getDocs(
      collection(db, "quizzes", quizId, "questions")
    );
    
    const deletePromises = questionsSnapshot.docs.map((questionDoc) =>
      deleteDoc(doc(db, "quizzes", quizId, "questions", questionDoc.id))
    );
    
    await Promise.all(deletePromises);

    // Delete the quiz itself
    await deleteDoc(doc(db, "quizzes", quizId));
    
    return true;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

/* =========================
   DELETE QUESTION
========================= */
export const deleteQuestion = async (quizId, questionId) => {
  try {
    await deleteDoc(doc(db, "quizzes", quizId, "questions", questionId));
    return true;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

/* =========================
   UPDATE QUESTION
========================= */
export const updateQuestion = async (quizId, questionId, questionData) => {
  try {
    const questionRef = doc(db, "quizzes", quizId, "questions", questionId);
    await updateDoc(questionRef, {
      ...questionData,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};
