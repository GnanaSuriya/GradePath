const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function migrate() {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
    console.error('ERROR: PostgreSQL DATABASE_URL is not configured in .env');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Connecting to SQLite...');
  const sqliteDb = await open({
    filename: path.resolve(__dirname, '../database/gradepath.sqlite'),
    driver: sqlite3.Database
  });

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create schema
    console.log('Creating PostgreSQL schema...');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);

    // Fetch data from SQLite
    const users = await sqliteDb.all('SELECT * FROM User');
    const profiles = await sqliteDb.all('SELECT * FROM AcademicProfile');
    const semesters = await sqliteDb.all('SELECT * FROM Semester');
    const subjects = await sqliteDb.all('SELECT * FROM Subject');

    console.log(`Found ${users.length} Users, ${profiles.length} Profiles, ${semesters.length} Semesters, ${subjects.length} Subjects in SQLite.`);

    // Migrate Users
    for (const u of users) {
      await client.query(
        'INSERT INTO "User" (id, email, name, picture, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [u.id, u.email, u.name, u.picture, u.created_at ? new Date(u.created_at) : new Date()]
      );
    }
    console.log('Users migrated: ' + users.length);

    // Migrate AcademicProfiles
    for (const p of profiles) {
      await client.query(
        `INSERT INTO "AcademicProfile" (user_id, university, program_category, degree, specialization, total_semesters, expected_grad_year, total_program_credits, current_semester, completed_semesters, grading_system, gender) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (user_id) DO NOTHING`,
        [p.user_id, p.university, p.program_category, p.degree, p.specialization, p.total_semesters, p.expected_grad_year, p.total_program_credits, p.current_semester, p.completed_semesters, p.grading_system, p.gender]
      );
    }
    console.log('Academic profiles migrated: ' + profiles.length);

    // Semesters and Subjects IDs mapping (since Postgres uses SERIAL which might differ if there were deletions)
    // To preserve relationships, we insert Semesters and keep track of mapping from old ID to new ID.
    // However, if we preserve the same integer ID, we can just insert with the exact ID and then update the sequence.
    let semMigrated = 0;
    for (const s of semesters) {
      const res = await client.query(
        'INSERT INTO "Semester" (id, user_id, semester_number, term_name, gpa, credits) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING RETURNING id',
        [s.id, s.user_id, s.semester_number, s.term_name, s.gpa, s.credits]
      );
      if (res.rowCount > 0) semMigrated++;
    }
    console.log('Semesters migrated: ' + semMigrated);
    
    // Update Semester Sequence
    const maxSem = await client.query('SELECT MAX(id) FROM "Semester"');
    if (maxSem.rows[0].max) {
      await client.query(`SELECT setval('"Semester_id_seq"', ${maxSem.rows[0].max})`);
    }

    // Migrate Subjects
    let subMigrated = 0;
    for (const s of subjects) {
      const res = await client.query(
        'INSERT INTO "Subject" (id, semester_id, name, code, credits, grade, grade_points) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING RETURNING id',
        [s.id, s.semester_id, s.name, s.code, s.credits, s.grade, s.grade_points]
      );
      if (res.rowCount > 0) subMigrated++;
    }
    console.log('Subjects migrated: ' + subMigrated);

    // Update Subject Sequence
    const maxSub = await client.query('SELECT MAX(id) FROM "Subject"');
    if (maxSub.rows[0].max) {
      await client.query(`SELECT setval('"Subject_id_seq"', ${maxSub.rows[0].max})`);
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed. Rolled back.', err);
  } finally {
    client.release();
    await pool.end();
    await sqliteDb.close();
  }
}

migrate();
