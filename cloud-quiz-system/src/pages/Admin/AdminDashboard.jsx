import { useEffect, useState, useContext } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { ToastContext } from "../../context/ToastContext";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const { success, error, warning } = useContext(ToastContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
  };

  /* ===============================
     APPROVE STUDENT
  =============================== */
  const approveStudent = async (userId) => {
    await updateDoc(doc(db, "users", userId), {
      approved: true,
    });

    fetchUsers();
  };

  /* ===============================
     MAKE TEACHER
  =============================== */
  const makeTeacher = async (userId) => {
    await updateDoc(doc(db, "users", userId), {
      role: "teacher",
      approved: true,
    });

    fetchUsers();
  };

  /* ===============================
     CREATE TEACHER DIRECTLY
  =============================== */
  const createTeacher = async (e) => {
    e.preventDefault();

    if (!teacherEmail || !teacherPassword) {
      warning("Enter email & password", 3000);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        teacherEmail,
        teacherPassword
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        email: teacherEmail,
        role: "teacher",
        approved: true,
        createdAt: Date.now(),
      });

      success("Teacher created successfully!", 3000);

      setTeacherEmail("");
      setTeacherPassword("");
      fetchUsers();
    } catch (err) {
      error(err.message, 4000);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>

        {/* ================= Create Teacher ================= */}
        <div className="card">
          <h3>Create Teacher Account</h3>

          <form onSubmit={createTeacher}>
            <input
              type="email"
              placeholder="Teacher Email"
              value={teacherEmail}
              onChange={(e)=>setTeacherEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Temporary Password"
              value={teacherPassword}
              onChange={(e)=>setTeacherPassword(e.target.value)}
            />

            <button type="submit">
              Create Teacher
            </button>
          </form>
        </div>

        {/* ================= Users List ================= */}
        <h3>All Users</h3>

        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <span className={`status-badge ${user.role}`}>{user.role.toUpperCase()}</span></p>
                <p><strong>Status:</strong> <span className={`status-badge ${user.approved ? 'approved' : 'pending'}`}>{user.approved ? "Approved" : "Pending"}</span></p>
              </div>

              <div className="user-actions">
                {/* Approve Student */}
                {user.role === "student" && !user.approved && (
                  <button onClick={() => approveStudent(user.id)}>
                    ✓ Approve Student
                  </button>
                )}

                {/* Promote to Teacher */}
                {user.role === "student" && user.approved && (
                  <button onClick={() => makeTeacher(user.id)}>
                    ⬆ Promote to Teacher
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}