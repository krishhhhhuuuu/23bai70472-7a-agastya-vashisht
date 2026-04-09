import { Router } from 'express';
import { db } from '../firebase-admin.js';
import { generateMCQs, getTutorExplanation, getAdaptiveDifficulty } from '../gemini.js';
import { verifyToken, requireTeacher, requireStudent } from '../middleware/auth.js';

const router = Router();

/* ============================================================
   POST /api/ai/generate-quiz
   Teacher uploads syllabus → Groq generates MCQs
   Body: { syllabusText, count, difficulty, topic, quizId?,
           generateFrom: 'syllabus'|'unit'|'topic',
           unitName?, customTopic? }
============================================================ */
router.post('/generate-quiz', verifyToken, requireTeacher, async (req, res) => {
  const {
    syllabusText, count = 10, difficulty = 'mixed',
    topic = '', quizId,
    generateFrom = 'syllabus', unitName, customTopic
  } = req.body;

  if (!syllabusText || syllabusText.trim().length < 3) {
    return res.status(400).json({ error: 'Please enter some syllabus content' });
  }

  if (count < 1 || count > 30) {
    return res.status(400).json({ error: 'Question count must be between 1 and 30' });
  }

  try {
    // Build focused content based on generateFrom mode
    let focusedContent = syllabusText;
    let focusTopic = topic;

    if (generateFrom === 'unit' && unitName) {
      // Extract just the unit section from full syllabus
      focusedContent = syllabusText;
      focusTopic = `${topic} - ${unitName}`;
    } else if (generateFrom === 'topic' && customTopic) {
      focusedContent = `Topic: ${customTopic}\n\nContext from syllabus:\n${syllabusText}`;
      focusTopic = customTopic;
    }

    const questions = await generateMCQs(focusedContent, count, difficulty, focusTopic);

    // If quizId provided, save as draft questions (status: pending_review)
    if (quizId) {
      // Verify teacher owns this quiz
      const quizDoc = await db.collection('quizzes').doc(quizId).get();
      if (!quizDoc.exists || quizDoc.data().createdBy !== req.user.uid) {
        return res.status(403).json({ error: 'Quiz not found or unauthorized' });
      }

      const batch = db.batch();
      const savedQuestions = [];

      for (const q of questions) {
        const ref = db.collection('quizzes').doc(quizId).collection('ai_drafts').doc();
        batch.set(ref, {
          ...q,
          status: 'pending_review', // teacher must approve before publishing
          generatedAt: Date.now(),
          generatedBy: req.user.uid,
        });
        savedQuestions.push({ id: ref.id, ...q });
      }

      await batch.commit();

      return res.json({
        success: true,
        questions: savedQuestions,
        message: `${questions.length} questions generated and saved as drafts. Review and publish them.`,
      });
    }

    // Otherwise just return questions without saving
    res.json({ success: true, questions });

  } catch (err) {
    console.error('Generate quiz error:', err);

    if (err.message?.includes('JSON')) {
      return res.status(500).json({ error: 'AI returned invalid format. Please try again.' });
    }

    res.status(500).json({ error: 'Failed to generate questions: ' + err.message });
  }
});

/* ============================================================
   POST /api/ai/publish-all
   Publish ALL pending draft questions for a quiz in one batch
   Body: { quizId, questions: [{ draftId, edits? }] }
============================================================ */
router.post('/publish-all', verifyToken, requireTeacher, async (req, res) => {
  const { quizId, questions } = req.body;

  if (!quizId || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'quizId and questions array required' });
  }

  try {
    // Verify teacher owns this quiz
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    if (!quizDoc.exists || quizDoc.data().createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Quiz not found or unauthorized' });
    }

    const batch = db.batch();
    const publishedIds = [];

    for (const { draftId, edits } of questions) {
      const draftRef = db.collection('quizzes').doc(quizId).collection('ai_drafts').doc(draftId);
      const draftDoc = await draftRef.get();
      if (!draftDoc.exists) continue;

      const draftData = draftDoc.data();
      const finalQuestion = {
        ...draftData,
        ...(edits || {}),
        publishedAt: Date.now(),
        publishedBy: req.user.uid,
      };
      // Remove draft-only fields
      delete finalQuestion.status;
      delete finalQuestion.generatedAt;
      delete finalQuestion.generatedBy;

      const liveRef = db.collection('quizzes').doc(quizId).collection('questions').doc();
      batch.set(liveRef, finalQuestion);
      batch.update(draftRef, { status: 'published', liveId: liveRef.id });
      publishedIds.push({ draftId, liveId: liveRef.id });
    }

    await batch.commit();

    res.json({ success: true, published: publishedIds.length, ids: publishedIds });
  } catch (err) {
    console.error('Publish all error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   POST /api/ai/publish-question
   Teacher approves a draft question → moves to live questions
   Body: { quizId, draftId, edits? }
============================================================ */
router.post('/publish-question', verifyToken, requireTeacher, async (req, res) => {
  const { quizId, draftId, edits } = req.body;

  if (!quizId || !draftId) {
    return res.status(400).json({ error: 'quizId and draftId required' });
  }

  try {
    const draftRef = db.collection('quizzes').doc(quizId).collection('ai_drafts').doc(draftId);
    const draftDoc = await draftRef.get();

    if (!draftDoc.exists) {
      return res.status(404).json({ error: 'Draft question not found' });
    }

    const draftData = draftDoc.data();

    // Apply any teacher edits
    const finalQuestion = {
      ...draftData,
      ...(edits || {}),
      status: 'published',
      publishedAt: Date.now(),
      publishedBy: req.user.uid,
    };

    // Remove draft-specific fields
    delete finalQuestion.status;

    // Save to live questions collection
    const liveRef = db.collection('quizzes').doc(quizId).collection('questions').doc();
    await liveRef.set(finalQuestion);

    // Mark draft as published
    await draftRef.update({ status: 'published', liveId: liveRef.id });

    res.json({ success: true, questionId: liveRef.id });

  } catch (err) {
    console.error('Publish question error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   DELETE /api/ai/reject-question
   Teacher rejects a draft question
   Body: { quizId, draftId }
============================================================ */
router.delete('/reject-question', verifyToken, requireTeacher, async (req, res) => {
  const { quizId, draftId } = req.body;

  try {
    await db.collection('quizzes').doc(quizId).collection('ai_drafts').doc(draftId).update({
      status: 'rejected',
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   GET /api/ai/drafts/:quizId
   Teacher fetches pending draft questions for a quiz
============================================================ */
router.get('/drafts/:quizId', verifyToken, requireTeacher, async (req, res) => {
  const { quizId } = req.params;

  try {
    const snapshot = await db
      .collection('quizzes').doc(quizId)
      .collection('ai_drafts')
      .where('status', '==', 'pending_review')
      .get();

    const drafts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ drafts });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   POST /api/ai/tutor
   Student asks AI tutor a question about a quiz answer
   Body: { question, studentAnswer, correctAnswer, explanation, userQuery }
============================================================ */
router.post('/tutor', verifyToken, requireStudent, async (req, res) => {
  const { question, studentAnswer, correctAnswer, explanation, userQuery } = req.body;

  if (!userQuery || userQuery.trim().length < 3) {
    return res.status(400).json({ error: 'Please enter a question' });
  }

  if (!question) {
    return res.status(400).json({ error: 'Question context required' });
  }

  try {
    const response = await getTutorExplanation(
      question,
      studentAnswer || 'Not answered',
      correctAnswer,
      explanation,
      userQuery
    );

    // Log tutor interaction to Firestore for analytics
    await db.collection('tutor_interactions').add({
      studentId: req.user.uid,
      question,
      userQuery,
      response,
      timestamp: Date.now(),
    });

    res.json({ success: true, response });

  } catch (err) {
    console.error('Tutor error:', err);
    res.status(500).json({ error: 'AI tutor unavailable. Please try again.' });
  }
});

/* ============================================================
   POST /api/ai/adaptive-next
   Get next question difficulty based on student performance
   Body: { correctCount, totalCount, currentDifficulty, quizId }
============================================================ */
router.post('/adaptive-next', verifyToken, requireStudent, async (req, res) => {
  const { correctCount, totalCount, currentDifficulty, quizId } = req.body;

  const nextDifficulty = getAdaptiveDifficulty(correctCount, totalCount, currentDifficulty);

  res.json({
    nextDifficulty,
    accuracy: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
  });
});

export default router;
