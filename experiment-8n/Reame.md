# 🚀 Experiment 8 – Frontend Integration with JWT APIs

## 📌 Project Overview

This project demonstrates the integration of a **React frontend** with a **Spring Boot backend** using **JWT-based authentication (session-based)**.

The application allows users to:

* Login using credentials
* Store JWT token in session
* Access protected APIs
* Logout securely
* Restrict access based on authentication state

---

## 🎯 Objective

* Implement frontend UI using React
* Integrate backend JWT APIs
* Store token in sessionStorage
* Restrict unauthorized access
* Demonstrate authentication flow

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React.js
* Bootstrap
* Axios
* React Router

### 🔹 Backend

* Spring Boot
* Spring Web
* Spring Security (basic config)

---

## 📁 Project Structure

```
experiment-8n/
├── backend/
│   └── Spring Boot Application
├── frontend/
│   └── React Application
└── screenshots/
    ├── login.png
    ├── dashboard.png
    ├── token.png
    ├── protected.png
    ├── unauthorized.png
    ├── logout.png
    ├── postman-login.png
    ├── postman-protected.png
    └── postman-unauthorized.png
```

---

## 🔐 Authentication Flow

1. User logs in using username & password
2. Backend validates credentials
3. Token is generated and sent to frontend
4. Token is stored in `sessionStorage`
5. Token is used in Authorization header for protected APIs
6. Logout removes token and redirects user

---

## 🌐 API Endpoints

### 🔹 Login API

* **POST** `/login`

Request:

```json
{
  "username": "admin",
  "password": "1234"
}
```

Response:

```json
{
  "token": "dummy-jwt-token-123"
}
```

---

### 🔹 Protected API

* **GET** `/protected`

Headers:

```
Authorization: Bearer <token>
```

Response:

```
Protected data 🔐
```

---

## 💻 How to Run the Project

### 🔹 Backend (Spring Boot)

1. Open project in IntelliJ
2. Run:

```
BackendApplication.java
```

3. Server runs on:

```
http://localhost:8080
```

---

### 🔹 Frontend (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🧪 Testing

### ✅ Frontend Testing

* Login with credentials
* Access dashboard
* Fetch protected data
* Logout functionality
* Unauthorized access handling

### ✅ Postman Testing

* Login API (token generation)
* Protected API (with token)
* Unauthorized request (without token)

---

## 📸 Screenshots Included

* Login Page UI
* Dashboard Page
* Token stored in sessionStorage
* Protected API success
* Unauthorized access redirect
* Logout functionality
* Postman API testing

---

## 🔑 Key Concepts

* JWT (JSON Web Token)
* Session-based authentication
* Protected routes
* Authorization header
* Client-server communication

---

## ⚠️ Note

This implementation uses a **dummy token** for demonstration purposes.
The focus of this experiment is **frontend integration**, not full JWT security implementation.

---

## 🎯 Conclusion

This project successfully demonstrates:

* Integration of frontend with backend APIs
* Session-based authentication
* Secure access to protected resources
* Proper handling of login and logout

---

## 👨‍💻 Author

Agastya Vashisht
CSE AIML Student – Chandigarh University

---
