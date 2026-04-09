# Backend Setup Guide

## 1. Get a Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

## 2. Get Firebase Admin SDK Credentials
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the values into your .env file

## 3. Create .env file
```
cp .env.example .env
```
Then fill in:
```
GEMINI_API_KEY=AIza...your_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173

FIREBASE_PROJECT_ID=cloudquizsystem-74f42
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@cloudquizsystem-74f42.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

## 4. Start the backend
```bash
npm run dev
```

## 5. Configure frontend
In the root project, create a `.env` file:
```
VITE_BACKEND_URL=http://localhost:5000
```

## 6. Start the frontend
```bash
npm run dev
```

## API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/ai/generate-quiz | Teacher | Generate MCQs from syllabus |
| GET | /api/ai/drafts/:quizId | Teacher | Get pending draft questions |
| POST | /api/ai/publish-question | Teacher | Approve and publish a draft |
| DELETE | /api/ai/reject-question | Teacher | Reject a draft question |
| POST | /api/ai/tutor | Student | Ask AI tutor a question |
| POST | /api/ai/adaptive-next | Student | Get adaptive difficulty |
