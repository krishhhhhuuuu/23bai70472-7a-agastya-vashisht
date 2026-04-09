const STUDENTS_KEY = "students_list";
const CURRENT_USER_KEY = "current_user";

// ✅ Get student list
export const getStudents = () => {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

// ✅ Add student
export const addStudent = (student) => {
  const students = getStudents();

  // prevent duplicate emails
  const exists = students.find((s) => s.email === student.email);
  if (exists) return false;

  students.push(student);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  return true;
};

// ✅ Find student (login)
export const findStudent = (email, password) => {
  const students = getStudents();
  return students.find((s) => s.email === email && s.password === password);
};

// ✅ Save logged-in user
export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// ✅ Get logged-in user
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// ✅ Logout
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
