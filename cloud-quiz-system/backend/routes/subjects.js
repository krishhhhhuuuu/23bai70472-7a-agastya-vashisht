import { Router } from 'express';
import { db } from '../firebase-admin.js';
import { verifyToken, requireTeacher } from '../middleware/auth.js';

const router = Router();

/* ============================================================
   GET /api/subjects/all  (students can see all subjects)
============================================================ */
router.get('/all', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('subjects').get();
    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   GET /api/subjects/:subjectId/detail  (subject + units for students)
============================================================ */
router.get('/:subjectId/detail', verifyToken, async (req, res) => {
  try {
    const subjectDoc = await db.collection('subjects').doc(req.params.subjectId).get();
    if (!subjectDoc.exists) return res.status(404).json({ error: 'Subject not found' });

    const unitsSnap = await db.collection('subjects')
      .doc(req.params.subjectId).collection('units').get();
    const units = unitsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Get quizzes linked to this subject
    const quizzesSnap = await db.collection('quizzes')
      .where('subjectId', '==', req.params.subjectId).get();
    const quizzes = quizzesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    res.json({ subject: { id: subjectDoc.id, ...subjectDoc.data() }, units, quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   GET /api/subjects
   Get all subjects for the authenticated teacher
============================================================ */
router.get('/', verifyToken, requireTeacher, async (req, res) => {
  try {
    const snap = await db.collection('subjects')
      .where('createdBy', '==', req.user.uid)
      .get();
    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   POST /api/subjects
   Create a new subject (+ optional units in one shot)
   Body: { name, description, colorIndex, fullSyllabus, units? }
============================================================ */
router.post('/', verifyToken, requireTeacher, async (req, res) => {
  const { name, description = '', colorIndex = 0, fullSyllabus = '', units = [] } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Subject name is required' });
  }

  try {
    const subjectRef = db.collection('subjects').doc();
    await subjectRef.set({
      name: name.trim(),
      description,
      colorIndex,
      fullSyllabus,
      createdBy: req.user.uid,
      createdAt: Date.now(),
    });

    // Save units if provided (from AI parse)
    const savedUnits = [];
    for (const u of units) {
      const unitRef = subjectRef.collection('units').doc();
      await unitRef.set({
        name: u.name,
        content: u.content || '',
        order: u.order || 1,
        topics: u.topics || [],
        createdAt: Date.now(),
      });
      savedUnits.push({ id: unitRef.id, ...u });
    }

    res.json({ success: true, subjectId: subjectRef.id, units: savedUnits });
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   DELETE /api/subjects/:subjectId
   Delete a subject and all its units
============================================================ */
router.delete('/:subjectId', verifyToken, requireTeacher, async (req, res) => {
  const { subjectId } = req.params;
  try {
    const subjectRef = db.collection('subjects').doc(subjectId);
    const subjectDoc = await subjectRef.get();

    if (!subjectDoc.exists || subjectDoc.data().createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Not found or unauthorized' });
    }

    // Delete all units
    const unitsSnap = await subjectRef.collection('units').get();
    const batch = db.batch();
    unitsSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(subjectRef);
    await batch.commit();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   GET /api/subjects/:subjectId/units
   Get all units for a subject
============================================================ */
router.get('/:subjectId/units', verifyToken, requireTeacher, async (req, res) => {
  try {
    const snap = await db.collection('subjects')
      .doc(req.params.subjectId)
      .collection('units')
      .get();
    const units = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ units });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   POST /api/subjects/:subjectId/units
   Add a unit to a subject
   Body: { name, content, order, topics? }
============================================================ */
router.post('/:subjectId/units', verifyToken, requireTeacher, async (req, res) => {
  const { name, content, order = 1, topics = [] } = req.body;

  if (!name?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Unit name and content are required' });
  }

  try {
    const unitRef = db.collection('subjects')
      .doc(req.params.subjectId)
      .collection('units')
      .doc();

    await unitRef.set({ name, content, order, topics, createdAt: Date.now() });
    res.json({ success: true, unitId: unitRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   PUT /api/subjects/:subjectId/units/:unitId
   Update a unit
============================================================ */
router.put('/:subjectId/units/:unitId', verifyToken, requireTeacher, async (req, res) => {
  const { name, content } = req.body;
  try {
    await db.collection('subjects')
      .doc(req.params.subjectId)
      .collection('units')
      .doc(req.params.unitId)
      .update({ name, content, updatedAt: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   DELETE /api/subjects/:subjectId/units/:unitId
   Delete a unit
============================================================ */
router.delete('/:subjectId/units/:unitId', verifyToken, requireTeacher, async (req, res) => {
  try {
    await db.collection('subjects')
      .doc(req.params.subjectId)
      .collection('units')
      .doc(req.params.unitId)
      .delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
