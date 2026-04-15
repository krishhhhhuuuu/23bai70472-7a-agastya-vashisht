# 🧪 Experiment 8: Frontend Integration with JWT APIs (Session-Based UI)

## 📌 Objective

To develop a React-based frontend application that integrates with JWT authentication APIs, implements session-based authentication, and restricts access to protected routes based on login state.

---

## 🛠️ Tech Stack

* React (Frontend Framework)
* Bootstrap (Styling)
* Material UI (UI Components)
* Axios (API Communication)
* Node.js & Express (Backend APIs)
* JSON Web Token (JWT)

---

## 📁 Project Structure

frontend/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   └── Dashboard.js
│   ├── App.js
│   └── index.js

backend/
├── server.js

---

## 🔐 Features Implemented

### 🔹 1. Login Page

* User enters username and password
* Sends POST request to `/login` API
* On successful authentication:

  * JWT token is received
  * Token is stored in `sessionStorage`
  * User is redirected to dashboard

---

### 🔹 2. Protected Dashboard

* Accessible only if JWT token exists
* Calls `/protected` API using Axios
* Token is sent in request header:

  ```
  Authorization: Bearer <token>
  ```
* Displays protected data on screen

---

### 🔹 3. Session-Based Authentication

* Token stored in browser `sessionStorage`
* If token is missing → user redirected to login page
* Ensures secure and restricted access

---

### 🔹 4. Logout Functionality

* Clears session using:

  ```
  sessionStorage.removeItem("token");
  ```
* Redirects user to login page

---

## 🔄 Working Flow

1. User opens login page
2. Enters credentials
3. Backend validates and returns JWT token
4. Token stored in sessionStorage
5. User redirected to dashboard
6. Dashboard fetches protected data using token
7. Unauthorized users are redirected to login
8. Logout removes token and ends session

---

## 🧪 API Endpoints

### 📌 POST /login

* Accepts username and password
* Returns JWT token

### 📌 GET /protected

* Requires JWT token in Authorization header
* Returns protected data if token is valid

---

## 📸 Screenshots Included

* ✅ Login Page UI
* ✅ Dashboard Page UI
* ✅ JWT Token stored in sessionStorage (DevTools)
* ✅ Protected API data displayed on UI
* ✅ Unauthorized access redirect to login
* ✅ Logout functionality working

---

## ✅ Conclusion

This experiment successfully demonstrates the integration of a React frontend with JWT-based backend authentication. It ensures secure access control using session-based token storage and protected routes.

---

## 👤 Author

Agastya Vashisht
CSE AIML – Chandigarh University
UID: 23BAI70472
