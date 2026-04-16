# 🚀 Experiment 9 – Frontend Integration with RBAC (React + Spring Boot)

---

## 📌 Project Overview

This project demonstrates frontend integration with a Role-Based Access Control (RBAC) backend built using Spring Boot.
The frontend is developed using React, which interacts with secured backend APIs and dynamically updates the UI based on user roles (USER / ADMIN).

---

## 🎯 Objective

* Build a React frontend for RBAC APIs
* Implement session-based authentication
* Restrict UI and API access based on roles
* Demonstrate role-based behavior from frontend

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React.js
* Bootstrap
* Axios
* React Router

### 🔹 Backend

* Spring Boot
* Spring Security
* H2 Database

---

## 📁 Project Structure

```
experiment-9/
├── backend/         # Spring Boot RBAC backend (from Experiment 7)
├── frontend/        # React frontend
└── screenshots/
    ├── login.png
    ├── user-dashboard.png
    ├── user-api.png
    ├── user-denied.png
    ├── admin-dashboard.png
    ├── admin-api.png
    └── session-storage.png
```

---

## 🔐 Authentication & Authorization Flow

1. User enters username and password
2. React frontend sends request using Basic Auth
3. Spring Boot backend authenticates the user
4. Role is determined on the frontend based on username
5. Role is stored in `sessionStorage`
6. User is redirected to the appropriate dashboard
7. UI and API access are controlled based on role

---

## 👤 User Roles

| Role  | Access                                      |
| ----- | ------------------------------------------- |
| USER  | `/api/user/profile`                         |
| ADMIN | `/api/user/profile`, `/api/admin/dashboard` |

---

## 🌐 API Endpoints (Backend)

| Endpoint               | Access      | Description            |
| ---------------------- | ----------- | ---------------------- |
| `/api/public/hello`    | Public      | Accessible to everyone |
| `/api/user/profile`    | USER, ADMIN | User profile           |
| `/api/admin/dashboard` | ADMIN       | Admin-only data        |

---

## 💻 How to Run the Project

### 🔹 Backend (Spring Boot)

1. Open the `backend` folder in IntelliJ IDEA
2. Run `Experiment7Application.java`
3. Backend runs on: `http://localhost:8080`

---

### 🔹 Frontend (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔑 Login Credentials

| Username | Password | Role  |
| -------- | -------- | ----- |
| user1    | password | USER  |
| admin1   | password | ADMIN |

---

## 🧪 Features Implemented

* Login with Basic Authentication
* Role-based redirection after login
* Role determined on frontend based on username
* Session storage for user & role
* Protected dashboards
* Role-based UI rendering
* Logout functionality
* API integration using Axios

---

## 📸 Screenshots Included

* Login Page
* USER Dashboard
* USER accessing user API
* USER denied access to admin API (403)
* ADMIN Dashboard
* ADMIN accessing admin API
* Session Storage showing role

---

## 🔐 Key Concepts

* Role-Based Access Control (RBAC)
* Authentication using Spring Security
* Authorization using roles
* Basic Auth integration
* Session-based UI control

---

## ⚠️ Note

* Backend enforces actual role-based security
* Frontend controls UI visibility based on role
* Role detection is handled on frontend for demonstration purposes

---

## 🎯 Conclusion

This project successfully demonstrates:

* Integration of React frontend with Spring Boot RBAC backend
* Role-based UI and API access control
* Secure communication using Basic Authentication
* Proper handling of authorized and unauthorized access

---

## 👨‍💻 Author

**Agastya Vashisht**
CSE (AIML) – Chandigarh University

---
