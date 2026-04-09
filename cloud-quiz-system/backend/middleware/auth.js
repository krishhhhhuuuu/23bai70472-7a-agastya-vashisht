import admin from '../firebase-admin.js';
import { db } from '../firebase-admin.js';

/**
 * Verify Firebase ID token from Authorization header
 * Attaches decoded user + Firestore role to req.user
 */
export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Fetch role from Firestore
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: userData?.role || 'student',
      approved: userData?.approved || false,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Require teacher or admin role
 */
export function requireTeacher(req, res, next) {
  if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  next();
}

/**
 * Require approved student
 */
export function requireStudent(req, res, next) {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ error: 'Student access required' });
  }
  if (!req.user?.approved) {
    return res.status(403).json({ error: 'Account not approved yet' });
  }
  next();
}
