import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const profile = (await db.query('SELECT * FROM "AcademicProfile" WHERE user_id = $1', [req.user?.id])).rows[0];
    const user = (await db.query('SELECT name, email, picture FROM "User" WHERE id = $1', [req.user?.id])).rows[0];
    
    if (!profile) {
       if (user) return res.json({ ...user });
       return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ ...profile, ...user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender } = req.body;
  
  try {
    if (name) {
      await db.query('UPDATE "User" SET name = $1 WHERE id = $2', [name, req.user?.id]);
    }
    await db.query(
      `INSERT INTO "AcademicProfile" 
      (user_id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE SET
      university = EXCLUDED.university,
      degree = EXCLUDED.degree,
      specialization = EXCLUDED.specialization,
      total_semesters = EXCLUDED.total_semesters,
      expected_grad_year = EXCLUDED.expected_grad_year,
      total_program_credits = EXCLUDED.total_program_credits,
      grading_system = EXCLUDED.grading_system,
      current_semester = EXCLUDED.current_semester,
      completed_semesters = EXCLUDED.completed_semesters,
      gender = EXCLUDED.gender`,
      [req.user?.id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
