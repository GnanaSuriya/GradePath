import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

let db: any;
(async () => {
  db = await open({
    filename: process.env.DATABASE_URL || './database/gradepath.sqlite',
    driver: sqlite3.Database
  });
})();

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
    let user = await db.get('SELECT * FROM User WHERE id = ?', [id]);
    
    if (!user) {
      await db.run('INSERT INTO User (id, email, name, picture) VALUES (?, ?, ?, ?)', [id, email, name, picture]);
      user = { id, email, name, picture };
    }

    // Check if onboarding is complete
    const profile = await db.get('SELECT * FROM AcademicProfile WHERE user_id = ?', [id]);
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
    const user = await db.get('SELECT * FROM User WHERE id = ?', [decoded.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const profile = await db.get('SELECT * FROM AcademicProfile WHERE user_id = ?', [decoded.id]);
    
    res.json({ ...user, needsOnboarding: !profile });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
