require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testDelete() {
  const client = await pool.connect();
  const testUserId = 'test-delete-user-123';
  try {
    // Setup test data
    await client.query('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', [testUserId, 'del@test.com', 'Delete Me']);
    await client.query('INSERT INTO "AcademicProfile" (user_id, university) VALUES ($1, $2)', [testUserId, 'Test Uni']);
    const semRes = await client.query('INSERT INTO "Semester" (user_id, semester_number, term_name) VALUES ($1, $2, $3) RETURNING id', [testUserId, 1, 'Fall']);
    const semId = semRes.rows[0].id;
    await client.query('INSERT INTO "Subject" (semester_id, name, credits) VALUES ($1, $2, $3)', [semId, 'Math', 3]);
    
    console.log('Test data created.');

    // Perform deletion as in the route
    await client.query('BEGIN');
    const semesters = (await client.query('SELECT id FROM "Semester" WHERE user_id = $1', [testUserId])).rows;
    const semesterIds = semesters.map(s => s.id);
    
    if (semesterIds.length > 0) {
      await client.query('DELETE FROM "Subject" WHERE semester_id = ANY($1::int[])', [semesterIds]);
    }
    await client.query('DELETE FROM "Semester" WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM "AcademicProfile" WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM "User" WHERE id = $1', [testUserId]);
    await client.query('COMMIT');

    console.log('Test deletion successful.');

    // Verify it is gone
    const check = await client.query('SELECT * FROM "User" WHERE id = $1', [testUserId]);
    if (check.rows.length === 0) {
      console.log('Verification: User record is completely gone.');
    } else {
      console.error('Verification failed: User still exists.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Test failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

testDelete();
