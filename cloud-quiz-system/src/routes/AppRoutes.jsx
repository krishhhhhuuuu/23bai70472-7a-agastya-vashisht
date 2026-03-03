import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import QuizAnalytics from "../pages/Teacher/QuizAnalytics";
import AllReports from "../pages/Teacher/AllReports";
import EditQuiz from "../pages/Teacher/EditQuiz";
import StudentDashboard from "../pages/Student/StudentDashboard";
import QuizAttempt from "../pages/Student/QuizAttempt";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher Route */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher Analytics Route */}
      <Route
        path="/teacher/analytics/:quizId"
        element={
          <ProtectedRoute allowedRole="teacher">
            <QuizAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Teacher All Reports Route */}
      <Route
        path="/teacher/reports"
        element={
          <ProtectedRoute allowedRole="teacher">
            <AllReports />
          </ProtectedRoute>
        }
      />

      {/* Teacher Edit Quiz Route */}
      <Route
        path="/teacher/edit/:quizId"
        element={
          <ProtectedRoute allowedRole="teacher">
            <EditQuiz />
          </ProtectedRoute>
        }
      />

      {/* Student Dashboard */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Quiz Attempt */}
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute allowedRole="student">
            <QuizAttempt />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}