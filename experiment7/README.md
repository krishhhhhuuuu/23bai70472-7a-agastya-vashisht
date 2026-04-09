# 🔐 Experiment 7: Role-Based Authorization (RBAC) using Spring Boot

## 📌 Objective

To implement **Role-Based Access Control (RBAC)** using Spring Boot and Spring Security, where API access is restricted based on user roles (**USER** and **ADMIN**).

---

## 🛠️ Technologies Used

* Java 17
* Spring Boot
* Spring Security
* Spring Data JPA
* H2 Database
* Maven

---

## 📂 Project Structure

```
experiment7/
│
├── src/
│   ├── main/
│   │   ├── java/com/example/experiment7/
│   │   │   ├── config/SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── PublicController.java
│   │   │   │   ├── UserController.java
│   │   │   │   └── AdminController.java
│   │   │   ├── entity/User.java
│   │   │   ├── repository/UserRepository.java
│   │   │   ├── service/CustomUserDetailsService.java
│   │   │   └── Experiment7Application.java
│   │   │
│   │   └── resources/application.properties
│   │
│   └── test/
│
├── screenshots/
│   ├── Public API.png
│   ├── USER LOGIN SUCCESS.png
│   ├── USER → ADMIN (403 Forbidden).png
│   ├── Admin Login Sucess.png
│   └── NO AUTH (401).png
│
└── pom.xml
```

---

## 🔐 Features Implemented

### ✅ Authentication

* Implemented using **Spring Security**
* Users login with username and password
* Passwords are encrypted using **BCrypt**

---

### ✅ Authorization (RBAC)

* Role-based access control implemented
* Roles:

  * `ROLE_USER`
  * `ROLE_ADMIN`

---

## 🌐 API Endpoints

| Endpoint               | Access      | Description                       |
| ---------------------- | ----------- | --------------------------------- |
| `/api/public/hello`    | Public      | Accessible without login          |
| `/api/user/profile`    | USER, ADMIN | Accessible to authenticated users |
| `/api/admin/dashboard` | ADMIN only  | Restricted to admin               |

---

## 🚫 Access Control Rules

* **401 Unauthorized** → No authentication provided
* **403 Forbidden** → Insufficient role permissions

---

## 👤 Default Users

| Username | Password | Role  |
| -------- | -------- | ----- |
| user1    | password | USER  |
| admin1   | password | ADMIN |

---

## 🧪 Testing (Postman)

### 🔹 Public API

`GET /api/public/hello` → 200 OK

### 🔹 USER Access

`GET /api/user/profile` → 200 OK

### 🔹 USER → ADMIN

`GET /api/admin/dashboard` → 403 Forbidden

### 🔹 ADMIN Access

`GET /api/admin/dashboard` → 200 OK

### 🔹 No Authentication

`GET /api/user/profile` → 401 Unauthorized

---

## 📸 Screenshots

The following screenshots are included:

1. **Public API.png** → Public endpoint working
2. **USER LOGIN SUCCESS.png** → User access success
3. **USER → ADMIN (403 Forbidden).png** → Access denied
4. **Admin Login Sucess.png** → Admin access success
5. **NO AUTH (401).png** → Unauthorized access

---

## 🎯 Conclusion

This project successfully demonstrates:

* Authentication using Spring Security
* Role-based authorization (RBAC)
* Secure API endpoints
* Proper handling of HTTP status codes (401 & 403)

---

## 👨‍💻 Author

* Name: Agastya Vashisht
* Course: CSE (AIML)
* University: Chandigarh University
