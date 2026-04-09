import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

/* =========================
   GET USER BY ID
========================= */
export const getUserById = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  return { id: userSnap.id, ...userSnap.data() };
};

/* =========================
   GET ALL USERS
========================= */
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
