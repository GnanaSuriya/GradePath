const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert mock user
    await client.query('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', ['test-debug-user', 'test@test.com', 'Test User']);

    // Test profile insert
    console.log("Testing AcademicProfile insert...");
    await client.query(
      `INSERT INTO "AcademicProfile" 
      (user_id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      ['test-debug-user', 'VIT', 'BTech', 'CSE', 8, 2024, 160, '10', 3, 2, 'Male']
    );
    console.log("AcademicProfile insert OK");

    // Test semester insert
    console.log("Testing Semester insert...");
    await client.query(
      `INSERT INTO "Semester" (user_id, semester_number, term_name, gpa, credits) VALUES ($1, $2, $3, $4, $5)`,
      ['test-debug-user', 1, 'Semester 1', 8.5, 20]
    );
    console.log("Semester insert OK");

    await client.query('ROLLBACK'); // Don't actually save test data
    console.log("All queries successful. Rolled back.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("PostgreSQL Error:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

test();
