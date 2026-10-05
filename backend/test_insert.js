const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function test() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      INSERT INTO "AcademicProfile" 
        (user_id, university, degree, specialization, total_semesters, expected_grad_year, total_program_credits, grading_system, current_semester, completed_semesters, gender) 
      VALUES ('test-user', 'test uni', 'test deg', 'test spec', 8, 2024, 160, '10', 3, 2, 'Male')
      RETURNING *
    `);
    console.log("Success:", res.rows);
  } catch (err) {
    console.error("PostgreSQL Error:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

test();
