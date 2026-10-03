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

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const profile = await db.get('SELECT * FROM AcademicProfile WHERE user_id = ?', [req.user?.id]);
    const user = await db.get('SELECT name, email, picture FROM User WHERE id = ?', [req.user?.id]);
    
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
      await db.run('UPDATE User SET name = ? WHERE id = ?', [name, req.user?.id]);
    }
    await db.run(
      `INSERT OR REPLACE INTO AcademicProfile 
      (user_id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user?.id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
