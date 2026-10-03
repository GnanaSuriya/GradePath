CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AcademicProfile" (
  user_id TEXT PRIMARY KEY REFERENCES "User"(id),
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
  gender TEXT
);

CREATE TABLE IF NOT EXISTS "Semester" (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES "User"(id),
  semester_number INTEGER,
  term_name TEXT,
  gpa REAL,
  credits INTEGER
);

CREATE TABLE IF NOT EXISTS "Subject" (
  id SERIAL PRIMARY KEY,
  semester_id INTEGER REFERENCES "Semester"(id),
  name TEXT,
  code TEXT,
  credits INTEGER,
  grade TEXT,
  grade_points REAL
);
