# Demo Credentials

This document contains the demo login credentials for testing the Cloud Quiz System.

## Quick Access

On the login page, you'll see three buttons to auto-fill credentials for different roles. Simply click the button for the role you want to test.

## Credentials

### 👨‍💼 Admin Account
- **Email:** `admin@quiz.com`
- **Password:** `admin123`
- **Access:** Full system access, can approve users, create teachers, manage all users

### 👨‍🏫 Teacher Account
- **Email:** `teacher@quiz.com`
- **Password:** `teacher123`
- **Access:** Create quizzes, add questions, view student reports, analytics, edit/delete quizzes

### 👨‍🎓 Student Account
- **Email:** `student@quiz.com`
- **Password:** `student123`
- **Access:** Take quizzes, view results, set goals, join study groups, ask teachers questions

## Features by Role

### Admin Features
- Approve/reject student registrations
- Promote students to teachers
- Create teacher accounts directly
- View all users in the system
- Manage user roles and permissions

### Teacher Features
- Create new quizzes with custom topics and duration
- Add multiple-choice questions to quizzes
- Edit existing quizzes and questions
- Delete quizzes and questions
- View detailed analytics for each quiz
- See student performance reports
- View reported questions and student comments
- Monitor AI-detected suspicious activities
- Access confidence analysis (Sure vs Guess)

### Student Features
- Browse and take available quizzes
- AI-powered camera monitoring during quizzes
- Report problematic questions
- Add comments on questions
- View personal analytics and performance
- Set learning goals and track progress
- Unlock achievements
- Join study groups and chat with peers
- Ask questions to teachers
- Track quiz streaks and statistics

## Important Notes

1. **Approval System:** New student signups require admin approval before they can access the system
2. **AI Monitoring:** Camera access is required during quiz attempts for proctoring
3. **Dark Mode:** Toggle available in the navbar for all users
4. **Toast Notifications:** All alerts have been replaced with modern toast notifications

## Setup Instructions

If these demo accounts don't exist in your Firebase database, you'll need to:

1. Create them through the signup page
2. Use the admin panel to approve and set roles
3. Or manually add them to your Firebase Firestore `users` collection

## Security Note

⚠️ These are demo credentials for testing purposes only. In a production environment:
- Use strong, unique passwords
- Implement proper password hashing
- Add rate limiting
- Enable two-factor authentication
- Remove or change demo credentials
