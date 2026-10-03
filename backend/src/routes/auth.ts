import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

router.post('/google', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: 'Access token required' });

  try {
    // Verify token with Google
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const { sub: id, name, email, picture } = googleRes.data;

    // Check if user exists
    let user = (await db.query('SELECT * FROM "User" WHERE id = $1', [id])).rows[0];
    
    if (!user) {
      await db.query('INSERT INTO "User" (id, email, name, picture) VALUES ($1, $2, $3, $4)', [id, email, name, picture]);
      user = { id, email, name, picture };
    }

    // Check if onboarding is complete
    const profile = (await db.query('SELECT * FROM "AcademicProfile" WHERE user_id = $1', [id])).rows[0];
    const needsOnboarding = !profile;

    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { ...user, needsOnboarding }
    });
  } catch (err: any) {
    console.error('Google Auth Error:', err.response?.data || err.message);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = (await db.query('SELECT * FROM "User" WHERE id = $1', [decoded.id])).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const profile = (await db.query('SELECT * FROM "AcademicProfile" WHERE user_id = $1', [decoded.id])).rows[0];
    
    res.json({ ...user, needsOnboarding: !profile });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
