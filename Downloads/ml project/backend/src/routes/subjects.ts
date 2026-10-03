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

// Get current semester subjects for user. 
// We use a special semester_id = -1 for 'current semester' since it's not a completed semester in the Semester table yet. Or we can just join. Let's use a dummy semester for the current one, or just add a user_id to Subject to make it easier, wait, Subject has semester_id.
// Better approach: Let's modify Subject table to have user_id, or we find the 'current' semester. 
// Let's create a "current" semester record automatically or just fetch subjects with a flag. 
// To keep it simple, I will create a semester with semester_number = 999 (Current) for the user if it doesn't exist.

async function getCurrentSemesterId(userId: string) {
  let sem = await db.get('SELECT id FROM Semester WHERE user_id = ? AND semester_number = 999', [userId]);
  if (!sem) {
    const result = await db.run('INSERT INTO Semester (user_id, semester_number, term_name) VALUES (?, 999, "Current")', [userId]);
    return result.lastID;
  }
  return sem.id;
}

// Get current subjects
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    const subjects = await db.all('SELECT * FROM Subject WHERE semester_id = ?', [semId]);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save extracted subjects (from VTOP)
router.post('/batch', authenticate, async (req: AuthRequest, res) => {
  const { subjects } = req.body;
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    
    // Clear old subjects for current semester if overriding? The prompt says "save to current semester".
    // For now, let's just insert them.
    for (const sub of subjects) {
       await db.run(
         'INSERT INTO Subject (semester_id, name, code, credits, grade) VALUES (?, ?, ?, ?, ?)', 
         [semId, sub.name, sub.code, sub.credits, null]
       );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a subject (like grade or grade_points)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { grade, grade_points } = req.body;
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    // ensure the subject belongs to the user's current semester
    await db.run(
      'UPDATE Subject SET grade = ?, grade_points = ? WHERE id = ? AND semester_id = ?', 
      [grade, grade_points, req.params.id, semId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a subject
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    await db.run('DELETE FROM Subject WHERE id = ? AND semester_id = ?', [req.params.id, semId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
