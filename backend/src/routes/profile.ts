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
  const { name, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender, semesters } = req.body;
  
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    if (name) {
      await client.query('UPDATE "User" SET name = $1 WHERE id = $2', [name, req.user?.id]);
    }
    
    // AcademicProfile UPSERT
    const existingProfile = (await client.query('SELECT id FROM "AcademicProfile" WHERE user_id = $1', [req.user?.id])).rows[0];
    if (existingProfile) {
      await client.query(
        `UPDATE "AcademicProfile" SET
          university = $1, degree = $2, specialization = $3, total_semesters = $4, expected_grad_year = $5,
          total_program_credits = $6, grading_system = $7, current_semester = $8, completed_semesters = $9, gender = $10
         WHERE user_id = $11`,
        [university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender, req.user?.id]
      );
    } else {
      await client.query(
        `INSERT INTO "AcademicProfile" 
        (user_id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [req.user?.id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender]
      );
    }

    if (semesters && Array.isArray(semesters)) {
      for (const sem of semesters) {
        if (sem.semester_number && sem.gpa !== undefined && sem.credits !== undefined) {
          const existingSem = (await client.query('SELECT id FROM "Semester" WHERE user_id = $1 AND semester_number = $2', [req.user?.id, sem.semester_number])).rows[0];
          
          if (existingSem) {
            await client.query(
              `UPDATE "Semester" SET term = $1, gpa = $2, credits = $3 WHERE id = $4`,
              [sem.term || `Semester ${sem.semester_number}`, sem.gpa, sem.credits, existingSem.id]
            );
          } else {
            await client.query(
              `INSERT INTO "Semester" (user_id, semester_number, term, gpa, credits) VALUES ($1, $2, $3, $4, $5)`,
              [req.user?.id, sem.semester_number, sem.term || `Semester ${sem.semester_number}`, sem.gpa, sem.credits]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error saving profile/semesters:", err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;
