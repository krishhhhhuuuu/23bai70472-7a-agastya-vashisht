alkimport 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import aiRoutes from './routes/ai.js';
import syllabusRoutes from './routes/syllabus.js';
import subjectRoutes from './routes/subjects.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: true, // allow all origins — restrict after confirming deployment works
  credentials: true,
}));

// ── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: '15mb' })); // Allow base64 images + large syllabus

// ── Rate Limiting ─────────────────────────────────────────────
// Only limit actual AI generation calls (Groq API), not Firestore operations
const aiGenerateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,                    // 5 generation requests per minute
  message: { error: 'Too many requests. Please wait a moment.' },
  skip: (req) => {
    // Only rate-limit the generation and tutor endpoints, not publish/reject/drafts
    const limited = ['/generate-quiz', '/tutor'];
    return !limited.some(path => req.path.startsWith(path));
  },
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/ai', aiGenerateLimiter, aiRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/subjects', subjectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Quiz AI Backend running on http://localhost:${PORT}`);
  console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✓ configured' : '✗ missing GEMINI_API_KEY'}`);
  console.log(`   Firebase:   ${process.env.FIREBASE_PROJECT_ID ? '✓ configured' : '✗ missing FIREBASE_PROJECT_ID'}`);
});
