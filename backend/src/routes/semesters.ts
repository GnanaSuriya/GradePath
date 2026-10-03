import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();

// Get all completed semesters for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const semesters = (await db.query('SELECT * FROM "Semester" WHERE user_id = $1 ORDER BY semester_number ASC', [req.user?.id])).rows;
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a completed semester
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { semester_number, gpa, credits } = req.body;
  try {
    const existing = (await db.query('SELECT * FROM "Semester" WHERE user_id = $1 AND semester_number = $2', [req.user?.id, semester_number])).rows[0];
    if (existing) {
       await db.query('UPDATE "Semester" SET gpa = $1, credits = $2 WHERE id = $3', [gpa, credits, existing.id]);
    } else {
       await db.query('INSERT INTO "Semester" (user_id, semester_number, gpa, credits) VALUES ($1, $2, $3, $4)', [req.user?.id, semester_number, gpa, credits]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a semester
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await db.query('DELETE FROM "Semester" WHERE id = $1 AND user_id = $2', [req.params.id, req.user?.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
