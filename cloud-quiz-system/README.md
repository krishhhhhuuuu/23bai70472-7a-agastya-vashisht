# Cloud Quiz System 🎓

A modern, feature-rich online quiz platform with AI-powered proctoring, real-time collaboration, and comprehensive analytics.

## ✨ Key Features

### 🎯 For Students
- **Interactive Quizzes** - Take quizzes with real-time monitoring
- **Personal Analytics** - Track performance and progress
- **Goal Setting** - Set targets and earn achievements
- **Study Groups** - Real-time chat with classmates
- **Ask Teacher** - Direct messaging to instructors
- **Dark Mode** - Eye-friendly interface
- **Progress Tracking** - Visual progress bars and streaks

### 👨‍🏫 For Teachers
- **Quiz Management** - Create, edit, and delete quizzes
- **Question Bank** - Add multiple-choice questions
- **Student Analytics** - Detailed performance reports
- **AI Detection Reports** - View proctoring data
- **Bulk Operations** - Manage multiple quizzes efficiently

### 👨‍💼 For Admins
- **User Management** - Approve students, create teachers
- **Role Assignment** - Promote users to different roles
- **System Overview** - Monitor platform usage

### 🤖 AI-Powered Proctoring
- **Face Detection** - Real-time face tracking
- **Multiple Face Detection** - Identify unauthorized help
- **Movement Tracking** - Detect looking away
- **Activity Monitoring** - Tab switches, copy-paste detection
- **Auto-Submit** - Automatic submission on violations

### 🎨 Modern UI/UX
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on all devices
- **Smooth Animations** - Polished user experience
- **Toast Notifications** - Non-intrusive alerts
- **Loading States** - Skeleton screens and spinners
- **Accessibility** - WCAG compliant

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cloud-quiz-system
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Create Firestore database
   - Update `src/firebase/firebase.js` with your config

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📚 Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Firebase (Auth + Firestore)
- **AI**: TensorFlow.js + BlazeFace
- **Routing**: React Router v7
- **Styling**: Custom CSS with CSS Variables

## 🎮 Keyboard Shortcuts

- `Ctrl/Cmd + D` - Toggle dark mode
- `Ctrl/Cmd + K` - Quick search (coming soon)
- `Esc` - Close modals
- Arrow keys - Navigate questions

## 🏆 Achievements System

Students can unlock 6 achievements:
- 🎯 First Steps - Complete first quiz
- 💯 Perfectionist - Get a perfect score
- 📚 Dedicated Learner - Complete 5 quizzes
- 🔥 Week Warrior - 7-day streak
- ⭐ High Achiever - 80%+ average
- 👑 Quiz Master - Complete 10 quizzes

## 📊 Analytics Features

### Student Analytics
- Total quizzes taken
- Average score
- Best score
- Pass rate
- Recent attempts
- Progress over time

### Teacher Analytics
- Per-quiz statistics
- Student performance comparison
- AI detection reports
- Confidence analysis
- Reported questions
- Student comments

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **Role-based Access** - Protected routes
- **AI Proctoring** - Detect cheating attempts
- **Activity Logging** - Track suspicious behavior
- **Encrypted Data** - Secure data storage

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Support

Fully responsive design works on:
- iOS 12+
- Android 8+
- Tablets and iPads

## 🎨 Customization

### Dark Mode
Toggle between light and dark themes with the moon/sun icon in the navbar.

### Theme Colors
Edit `src/styles/global.css` to customize colors:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

## 🐛 Troubleshooting

### Camera Not Working
1. Check browser permissions
2. Ensure HTTPS connection
3. Close other apps using camera
4. See `CAMERA_TROUBLESHOOTING.md`

### AI Monitoring Issues
1. Verify TensorFlow packages installed
2. Check browser console for errors
3. See `AI_MONITORING_GUIDE.md`

## 📄 License

MIT License - feel free to use for educational purposes

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines first.

## 📧 Support

For issues or questions, please open a GitHub issue.

## 🎯 Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Question import/export
- [ ] LMS integration
- [ ] Blockchain certificates
- [ ] Voice commands
- [ ] Multi-language support

## ⭐ Features That Make Us Different

1. **AI-Powered Proctoring** - Real-time face detection
2. **Goal Setting** - Motivational progress tracking
3. **Study Groups** - Built-in collaboration
4. **Dark Mode** - Modern UI/UX
5. **Achievements** - Gamification elements
6. **Real-time Chat** - Student-teacher communication
7. **Comprehensive Analytics** - Detailed insights
8. **Question Reporting** - Student feedback system

---

Made with ❤️ for better online education
