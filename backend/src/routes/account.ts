import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import axios from 'axios';
import db from '../db';

const router = Router();

// Delete Account
router.delete('/', authenticate, async (req: AuthRequest, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: 'Google access token required' });

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // 1. Verify Google access_token
  try {
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (googleRes.data.sub !== userId) {
      return res.status(403).json({ error: 'Google identity mismatch' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  // 2. Perform deletion in transaction
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Find all semesters for this user
    const semesters = (await client.query('SELECT id FROM "Semester" WHERE user_id = $1', [userId])).rows;
    const semesterIds = semesters.map(s => s.id);
    
    if (semesterIds.length > 0) {
      // Delete subjects for these semesters
      await client.query('DELETE FROM "Subject" WHERE semester_id = ANY($1::int[])', [semesterIds]);
    }
    
    // Delete Semesters
    await client.query('DELETE FROM "Semester" WHERE user_id = $1', [userId]);
    
    // Delete AcademicProfile
    await client.query('DELETE FROM "AcademicProfile" WHERE user_id = $1', [userId]);
    
    // Delete User
    await client.query('DELETE FROM "User" WHERE id = $1', [userId]);
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Account deletion error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  } finally {
    client.release();
  }
});

export default router;
