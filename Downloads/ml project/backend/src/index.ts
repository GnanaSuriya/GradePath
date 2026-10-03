import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database setup
let db: any;
(async () => {
  db = await open({
    filename: process.env.DATABASE_URL || './database/gradepath.sqlite',
    driver: sqlite3.Database
  });

  // Initialize tables (Phase 18)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS AcademicProfile (
      user_id TEXT PRIMARY KEY,
      university TEXT,
      program_category TEXT,
      degree TEXT,
      specialization TEXT,
      total_semesters INTEGER,
      expected_grad_year INTEGER,
      total_program_credits INTEGER,
      current_semester INTEGER,
      completed_semesters INTEGER,
      grading_system TEXT,
      gender TEXT,
      FOREIGN KEY(user_id) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Semester (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      semester_number INTEGER,
      term_name TEXT,
      gpa REAL,
      credits INTEGER,
      FOREIGN KEY(user_id) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Subject (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER,
      name TEXT,
      code TEXT,
      credits INTEGER,
      grade TEXT,
      grade_points REAL,
      FOREIGN KEY(semester_id) REFERENCES Semester(id)
    );
  `);
  console.log("Database initialized.");
})();

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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
