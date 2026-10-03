import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gradepath-frontend.vercel.app'
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Database initialization moved to out-of-band scripts

import authRouter from './routes/auth';
import mlRouter from './routes/ml';

import profileRouter from './routes/profile';
import semestersRouter from './routes/semesters';
import subjectsRouter from './routes/subjects';
import timetableRouter from './routes/timetable';

// Basic Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/ml', mlRouter);
app.use('/api/profile', profileRouter);
app.use('/api/semesters', semestersRouter);
app.use('/api/current-semester/subjects', subjectsRouter);
app.use('/api/timetable', timetableRouter);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export default app;
