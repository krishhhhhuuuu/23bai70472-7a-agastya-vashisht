# CloudQuiz System — Project Report

**Project Title:** CloudQuiz — AI-Powered Quiz & Learning Management System  
**Technology Stack:** React.js, Node.js/Express, Firebase, Groq AI (LLaMA 3.3), TensorFlow.js  
**Deployment:** Vercel (Frontend) + Render (Backend) + Firebase (Database & Auth)

---

## 1. Project Overview

CloudQuiz is a full-stack web application designed for educational institutions to manage quizzes, syllabi, and student performance. It integrates artificial intelligence at multiple levels — from quiz generation to real-time exam proctoring — making it a comprehensive smart learning platform.

The system supports three user roles: **Admin**, **Teacher**, and **Student**, each with a dedicated dashboard and feature set.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│              React.js + Vite + TensorFlow.js             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS API calls
┌──────────────────────▼──────────────────────────────────┐
│                   BACKEND (Render)                       │
│              Node.js + Express.js                        │
│         Groq AI (LLaMA 3.3-70B) Integration             │
└──────────┬───────────────────────────┬──────────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼────────────────┐
│  Firebase Firestore  │   │   Firebase Authentication   │
│  (Database)          │   │   (User Management)         │
└─────────────────────┘   └─────────────────────────────┘
```

---

## 3. Features by Module

### 3.1 Authentication System
- Email/password registration and login
- Google OAuth sign-in
- Role-based access control (Admin / Teacher / Student)
- Admin approval required for student accounts
- Protected routes per role
- JWT token verification on all backend API calls

---

### 3.2 Admin Dashboard

| Feature | Description |
|---------|-------------|
| System Overview | Real-time stats — total users, quizzes, attempts, pass rate, flagged attempts |
| User Management | Search, filter, sort users by role/status; approve, revoke, promote, demote, delete |
| Bulk Actions | Select multiple users → bulk approve or bulk delete |
| Quiz Management | View all quizzes across all teachers; delete any quiz |
| Flagged Attempts | Dedicated tab showing suspicious exam attempts with AI detection logs |
| Announcements | Post system-wide announcements with type (info/warning/success/urgent) |
| Create Teacher | Create teacher accounts directly with email + password |
| Analytics | User breakdown charts, score distribution (A/B/C/F bands), teacher performance table |

---

### 3.3 Teacher Dashboard

| Feature | Description |
|---------|-------------|
| Overview | Stats: total quizzes, AI-generated count, total attempts, flagged count |
| Subjects & Syllabus | Create subjects, upload syllabus in any format, manage units |
| My Quizzes | View, edit, delete quizzes; delete all quizzes at once |
| Create Quiz | Manual quiz creation with title, topic, duration, deadline |
| Quiz Deadline | Set deadline per quiz; expired quizzes auto-blocked for students |
| Reports | Inline student attempt reports with confidence analysis, flagged alerts |
| Student Messages | Real-time chat inbox — reply to student questions |
| AI Generator | Generate MCQs from syllabus using Groq LLaMA AI |

---

### 3.4 AI Quiz Generator

| Feature | Description |
|---------|-------------|
| Multi-format Syllabus Input | Accept text, image (JPG/PNG), PDF, DOCX, TXT |
| AI Syllabus Parsing | AI extracts and organises units/topics from uploaded content |
| Smart Content Detection | Auto-hides syllabus input when subject content already available |
| Generation Modes | Full syllabus / Specific unit / Custom topic |
| Question Count | Configurable 3–30 questions per generation |
| Difficulty Levels | Easy / Medium / Hard / Mixed |
| Draft Review System | Generated questions saved as drafts; teacher reviews before publishing |
| Inline Editing | Edit question text, options, correct answer before publishing |
| Bulk Publish | Publish all questions in a single API call (no rate limit issues) |
| Individual Actions | Approve or reject each question individually |

---

### 3.5 Syllabus Management

| Feature | Description |
|---------|-------------|
| Subject Creation | Create subjects with name, description, color theme |
| Smart Upload | Upload syllabus as text, image, PDF, or DOCX |
| AI Organisation | AI parses uploaded content → auto-creates units with topics |
| Unit Management | Add, edit, delete units/chapters within a subject |
| Auto Unit Creation | When creating a subject with AI-parsed syllabus, units saved automatically |
| Subject Linking | Quizzes linked to subjects; students see quizzes per subject |

---

### 3.6 Student Dashboard

| Feature | Description |
|---------|-------------|
| Home Tab | Welcome banner, stats overview, pending test alerts, recent activity |
| Subjects Tab | Grid of all subjects with color banners; click to open subject detail |
| Tests Tab | Pending tests (NEW badge) and completed tests with scores |
| Deadline Display | Color-coded deadline badges (green/orange/grey/expired) |
| Analytics Tab | Personal performance stats — avg score, best score, pass rate |
| Goals Tab | Set personal goals; progress bars; achievement badges |
| Study Groups | Create/join study groups; real-time group chat |
| Ask Teacher | Direct messaging with teachers; real-time chat |

---

### 3.7 Subject Detail Page (Student)

| Feature | Description |
|---------|-------------|
| Syllabus Tab | Full syllabus text + expandable unit cards with topic tags |
| Quizzes Tab | All quizzes linked to this subject with Start button |
| AI Tutor Tab | Chat with AI about the subject syllabus; focus on specific units |
| Quick Prompts | Pre-built prompts: "Summarise", "Key points", "Exam questions" |

---

### 3.8 Quiz Attempt System

| Feature | Description |
|---------|-------------|
| Timed Quiz | Countdown timer; auto-submit on time expiry |
| Confidence Tracking | Student marks each answer as "Sure" or "Guess" |
| Question Reporting | Report issues per question (wrong answer, unclear wording, etc.) |
| Comments | Add comments on individual questions |
| Adaptive Difficulty | Tracks performance and adjusts difficulty suggestions |
| Deadline Enforcement | Expired quizzes blocked at attempt page level |

---

### 3.9 AI Proctoring (Live Camera Monitoring)

| Feature | Description |
|---------|-------------|
| Face Detection | BlazeFace model detects faces in real-time every 5 seconds |
| No Face Alert | Flags when student looks away from camera |
| Multiple Face Alert | Flags when more than one person detected |
| Head Movement Detection | Flags significant head movement (>150px displacement) |
| Tab Switch Detection | Counts tab switches and window blur events |
| Copy Prevention | Blocks right-click and copy during exam |
| Auto Submit | Auto-submits quiz after 10 suspicious incidents |
| Snapshot Capture | Captures video frame on suspicious detection |
| Incident Logging | All detections saved to Firestore with timestamps |
| Flagged Report | Teachers see full incident breakdown per student attempt |

---

### 3.10 Result & AI Tutor (Post-Quiz)

| Feature | Description |
|---------|-------------|
| Grade Display | A+/A/B/C/D/F grade with color coding and motivational label |
| Score Progress Bar | Animated progress bar showing percentage |
| Answer Explanations | Every question shows correct answer + explanation |
| Wrong Answer Highlight | Incorrect answers highlighted in red; correct in green |
| "Your Answer" Label | Student's chosen option clearly labelled |
| AI Tutor Chat | Ask AI about any question; context-aware explanations |
| Question Selector | Pick any question from the list to discuss with AI |
| Chat History | Full conversation history per question |

---

## 4. Technology Stack Details

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js 18 | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Firebase SDK | Auth + Firestore client |
| TensorFlow.js | In-browser face detection |
| BlazeFace | Face detection model |
| CSS (custom) | Styling with glass morphism design |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| Firebase Admin SDK | Server-side Firestore access (bypasses security rules) |
| Groq SDK | LLaMA 3.3-70B AI model API |
| Multer | File upload handling |
| pdf-parse | PDF text extraction |
| JSZip | DOCX text extraction |
| express-rate-limit | Rate limiting for AI endpoints |
| CORS | Cross-origin request handling |

### AI Models Used
| Model | Provider | Purpose |
|-------|---------|---------|
| LLaMA 3.3-70B Versatile | Groq | Quiz generation, syllabus parsing |
| LLaMA 4 Scout 17B | Groq | Image-to-text (syllabus image reading) |
| BlazeFace | TensorFlow.js | Real-time face detection |

### Database (Firebase Firestore)
| Collection | Purpose |
|-----------|---------|
| users | User profiles and roles |
| quizzes | Quiz metadata |
| quizzes/{id}/questions | Published quiz questions |
| quizzes/{id}/ai_drafts | AI-generated draft questions |
| attempts | Student quiz submissions |
| subjects | Subject/course data |
| subjects/{id}/units | Syllabus units per subject |
| messages | Teacher-student direct messages |
| studyGroups | Study group metadata |
| studyGroups/{id}/messages | Group chat messages |
| studentGoals | Personal learning goals |
| tutor_interactions | AI tutor chat logs |
| announcements | Admin announcements |

---

## 5. API Endpoints

### AI Routes (`/api/ai`)
| Method | Endpoint | Role | Description |
|--------|---------|------|-------------|
| POST | /generate-quiz | Teacher | Generate MCQs from syllabus text |
| POST | /publish-all | Teacher | Bulk publish all draft questions |
| POST | /publish-question | Teacher | Publish single draft question |
| DELETE | /reject-question | Teacher | Reject a draft question |
| GET | /drafts/:quizId | Teacher | Get pending draft questions |
| POST | /tutor | Student | Ask AI tutor a question |
| POST | /adaptive-next | Student | Get adaptive difficulty suggestion |

### Syllabus Routes (`/api/syllabus`)
| Method | Endpoint | Role | Description |
|--------|---------|------|-------------|
| POST | /parse-text | Teacher | Parse plain text syllabus |
| POST | /parse-image | Teacher | Extract text from syllabus image |
| POST | /parse-document | Teacher | Extract text from PDF/DOCX/TXT |

### Subject Routes (`/api/subjects`)
| Method | Endpoint | Role | Description |
|--------|---------|------|-------------|
| GET | / | Teacher | Get teacher's subjects |
| GET | /all | Any | Get all subjects (for students) |
| POST | / | Teacher | Create subject with optional units |
| DELETE | /:id | Teacher | Delete subject and all units |
| GET | /:id/detail | Any | Get subject + units + quizzes |
| GET | /:id/units | Teacher | Get units of a subject |
| POST | /:id/units | Teacher | Add unit to subject |
| PUT | /:id/units/:uid | Teacher | Update a unit |
| DELETE | /:id/units/:uid | Teacher | Delete a unit |

---

## 6. Key Design Decisions

**1. Backend-first Firestore writes**  
All subject/unit creation goes through the Express backend using Firebase Admin SDK, which bypasses Firestore security rules. This avoids complex rule configurations and permission errors.

**2. Bulk publish endpoint**  
Publishing questions one-by-one hit the rate limiter (3 req/min). A single `/publish-all` endpoint uses Firestore batch writes to publish all questions atomically in one request.

**3. Rate limiting scope**  
Rate limiting only applies to `/generate-quiz` and `/tutor` (actual Groq API calls). Firestore operations like publish/reject are not rate-limited.

**4. Vite TensorFlow exclusion**  
TensorFlow packages use CommonJS internally and can't be bundled by Vite/esbuild. They're excluded from optimization and loaded via dynamic imports with `@vite-ignore` at runtime.

**5. AI syllabus parsing**  
Rather than storing raw text, the AI organises syllabus content into structured units with topics. This enables targeted quiz generation per unit and better AI tutor context.

---

## 7. PPT Slide Outline

### Slide 1 — Title
- CloudQuiz: AI-Powered Quiz & Learning Management System
- Team members, course, date

### Slide 2 — Problem Statement
- Manual quiz creation is time-consuming
- No real-time exam integrity monitoring
- Disconnected syllabus and assessment systems
- No personalised learning feedback

### Slide 3 — Solution Overview
- AI-generated quizzes from any syllabus format
- Real-time camera-based proctoring
- Subject-linked quiz management
- AI tutor for post-quiz learning

### Slide 4 — System Architecture
- Diagram: Frontend → Backend → Firebase + Groq AI

### Slide 5 — Three-Role System
- Admin: system control, user management, analytics
- Teacher: syllabus upload, quiz generation, reports
- Student: learn, attempt, get AI explanations

### Slide 6 — AI Quiz Generation
- Upload syllabus (text/image/PDF/DOCX)
- AI parses and organises into units
- Generate 3–30 MCQs with difficulty control
- Teacher reviews drafts before publishing

### Slide 7 — AI Proctoring
- BlazeFace model — real-time face detection
- Detects: no face, multiple faces, head movement
- Tab switch + copy prevention
- Auto-submit on 10 incidents
- Full incident log for teachers

### Slide 8 — Student Experience
- Subject browser with syllabus view
- Tests tab with deadlines and NEW badges
- Post-quiz explanations for every answer
- AI Tutor chat — ask anything about the topic

### Slide 9 — Admin Panel
- Live stats dashboard
- Bulk user management
- Flagged attempt review
- System-wide announcements

### Slide 10 — Tech Stack
- React + Vite, Node.js + Express
- Firebase (Auth + Firestore)
- Groq LLaMA 3.3-70B, BlazeFace
- Deployed: Vercel + Render

### Slide 11 — Demo Screenshots
- (Add screenshots of each dashboard)

### Slide 12 — Conclusion
- Fully functional AI-integrated LMS
- Scalable architecture
- Real-world applicable for schools/colleges
- Future: mobile app, more AI models, video proctoring

---

## 8. Future Enhancements

1. Mobile app (React Native)
2. Video recording during exam for review
3. YOLO-based object detection (phone, book detection)
4. Automated grading for subjective answers
5. Student performance prediction using ML
6. Integration with Google Classroom / LMS platforms
7. Multi-language support
8. Offline quiz mode with sync

---

*Report prepared for academic submission — CloudQuiz System*
