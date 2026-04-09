import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import AdminLogin from "../pages/Auth/AdminLogin";
import StudentLogin from "../pages/Auth/StudentLogin";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import StudentDashboard from "../pages/Student/StudentDashboard";
import QuizAttempt from "../pages/Student/QuizAttempt";
import Result from "../pages/Student/Result";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/student-login" element={<StudentLogin />} />

      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/quiz/:quizId" element={<QuizAttempt />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}
