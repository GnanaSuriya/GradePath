import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();

// Get current semester subjects for user. 
// We use a special semester_id = -1 for 'current semester' since it's not a completed semester in the Semester table yet. Or we can just join. Let's use a dummy semester for the current one, or just add a user_id to Subject to make it easier, wait, Subject has semester_id.
// Better approach: Let's modify Subject table to have user_id, or we find the 'current' semester. 
// Let's create a "current" semester record automatically or just fetch subjects with a flag. 
// To keep it simple, I will create a semester with semester_number = 999 (Current) for the user if it doesn't exist.

async function getCurrentSemesterId(userId: string) {
  let sem = (await db.query('SELECT id FROM "Semester" WHERE user_id = $1 AND semester_number = 999', [userId])).rows[0];
  if (!sem) {
    const result = await db.query('INSERT INTO "Semester" (user_id, semester_number, term_name) VALUES ($1, 999, \'Current\') RETURNING id', [userId]);
    return result.rows[0].id;
  }
  return sem.id;
}

// Get current subjects
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    const subjects = (await db.query('SELECT * FROM "Subject" WHERE semester_id = $1', [semId])).rows;
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save extracted subjects (from VTOP) or Manual GPA Calculator
router.post('/batch', authenticate, async (req: AuthRequest, res) => {
  const { subjects } = req.body;
  const client = await db.connect();
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    
    await client.query('BEGIN');
    // Clear old subjects for current semester to prevent duplicates/resurrections
    await client.query('DELETE FROM "Subject" WHERE semester_id = $1', [semId]);

    // Insert new subjects
    for (const sub of subjects) {
       await client.query(
         'INSERT INTO "Subject" (semester_id, name, code, credits, grade) VALUES ($1, $2, $3, $4, $5)', 
         [semId, sub.name, sub.code, sub.credits, sub.grade || null]
       );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update a subject (like grade or grade_points)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { grade, grade_points } = req.body;
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    // ensure the subject belongs to the user's current semester
    await db.query(
      'UPDATE "Subject" SET grade = $1, grade_points = $2 WHERE id = $3 AND semester_id = $4', 
      [grade, grade_points, req.params.id, semId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all subjects for current semester
router.delete('/all', authenticate, async (req: AuthRequest, res) => {
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    await db.query('DELETE FROM "Subject" WHERE semester_id = $1', [semId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a subject
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const semId = await getCurrentSemesterId(req.user?.id as string);
    await db.query('DELETE FROM "Subject" WHERE id = $1 AND semester_id = $2', [req.params.id, semId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
