import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const router = Router();
let db: any;
(async () => {
  db = await open({
    filename: process.env.DATABASE_URL || './database/gradepath.sqlite',
    driver: sqlite3.Database
  });
})();

// Get all completed semesters for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const semesters = await db.all('SELECT * FROM Semester WHERE user_id = ? ORDER BY semester_number ASC', [req.user?.id]);
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a completed semester
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { semester_number, gpa, credits } = req.body;
  try {
    const existing = await db.get('SELECT * FROM Semester WHERE user_id = ? AND semester_number = ?', [req.user?.id, semester_number]);
    if (existing) {
       await db.run('UPDATE Semester SET gpa = ?, credits = ? WHERE id = ?', [gpa, credits, existing.id]);
    } else {
       await db.run('INSERT INTO Semester (user_id, semester_number, gpa, credits) VALUES (?, ?, ?, ?)', [req.user?.id, semester_number, gpa, credits]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a semester
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await db.run('DELETE FROM Semester WHERE id = ? AND user_id = ?', [req.params.id, req.user?.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
