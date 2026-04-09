# 🧪 Experiment 6 – JWT Authentication using Spring Boot

## 📌 Objective

Implement **JWT (JSON Web Token) Authentication** in a Spring Boot backend application.
The system should support:

* User **login with username and password**
* **JWT token generation** after successful authentication
* **Protected routes** that require a valid JWT token
* **Testing authentication using Postman**

This experiment demonstrates how **session management using JWT tokens** works in a backend application.

---

# 🧱 Project Folder Structure

```
experiment-6
│
├── src/
│   └── main/
│       ├── java/com/codingexample/firstProject/
│       │
│       │   ├── controller/
│       │   │     ├── AuthController.java
│       │   │     └── StudentController.java
│       │   │
│       │   ├── security/
│       │   │     ├── JwtUtil.java
│       │   │     ├── JwtFilter.java
│       │   │     └── SecurityConfig.java
│       │   │
│       │   ├── service/
│       │   │     ├── StudentService.java
│       │   │     └── InMemoryStudentService.java
│       │   │
│       │   ├── model/
│       │   │     └── Student.java
│       │   │
│       │   ├── dto/
│       │   │     ├── StudentRequest.java
│       │   │     └── StudentResponse.java
│       │   │
│       │   ├── exception/
│       │   │     ├── ApiError.java
│       │   │     ├── BadRequestException.java
│       │   │     ├── ResourceNotFoundException.java
│       │   │     └── GlobalExceptionHandler.java
│       │   │
│       │   └── FirstProjectApplication.java
│       │
│       └── resources/
│           └── application.properties
│
├── Screenshots/
│   ├── login-request.png
│   ├── jwt-token.png
│   └── protected-route.png
│
├── pom.xml
└── README.md
```

---

# 🚀 Application Execution Flow

When the application starts:

```
Run FirstProjectApplication.java
        ↓
Spring Boot starts embedded Tomcat server
        ↓
Spring scans components (@Controller, @Service, etc.)
        ↓
Application becomes ready to receive HTTP requests
```

Entry point file:

```java
@SpringBootApplication
public class FirstProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(FirstProjectApplication.class, args);
    }

}
```

---

# 🔐 JWT Authentication Flow

### 1️⃣ Login Request

User sends login credentials.

```
POST /login
```

Example Request Body:

```json
{
  "username": "admin",
  "password": "1234"
}
```

If credentials are valid, the server generates a **JWT token**.

Example Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### 2️⃣ Access Protected Route

Protected routes require a **JWT token in the Authorization header**.

Example API:

```
GET /api/students
```

Header:

```
Authorization: Bearer <JWT_TOKEN>
```

If the token is valid, the server returns the requested data.

Example Response:

```json
[]
```

If the token is missing or invalid:

```
401 Unauthorized
```

---

# 🔄 Request Processing Flow

```
Client (Postman)
        ↓
Tomcat Server
        ↓
DispatcherServlet
        ↓
Security Filter (JWT Validation)
        ↓
Controller
        ↓
Service Layer
        ↓
Response returned as JSON
```

---

# 📡 Postman Testing Steps

### Step 1 – Login Request

Method:

```
POST http://localhost:8080/login
```

Body:

```json
{
  "username": "admin",
  "password": "1234"
}
```

Result:

JWT token generated.

---

### Step 2 – Use JWT Token

Send request to protected route.

```
GET http://localhost:8080/api/students
```

Authorization header:

```
Bearer <JWT_TOKEN>
```

Result:

Protected API accessed successfully.

---

# 📸 Required Screenshots

The following screenshots are included in the **Screenshots folder**:

1️⃣ Login request with username and password
2️⃣ JWT token received after successful authentication
3️⃣ Access to protected route using Authorization header

---

# ⚙️ Technologies Used

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| Spring Boot     | Backend framework           |
| Spring Security | Authentication and security |
| JWT (JJWT)      | Token-based authentication  |
| Maven           | Dependency management       |
| Postman         | API testing                 |
| Java            | Programming language        |

---

# 🧠 Key Concepts Demonstrated

* JWT Authentication
* Spring Boot REST APIs
* Layered Architecture (Controller → Service → Model)
* Spring Security Configuration
* Dependency Injection
* Token-based session management

---

# 🏁 Conclusion

This experiment demonstrates how **JWT authentication secures REST APIs in a Spring Boot backend**.

JWT tokens allow stateless authentication where the server does not store session data.
Instead, the token contains encoded user information that is verified for every request.

This approach improves **security, scalability, and performance** in modern backend applications.
