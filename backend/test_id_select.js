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
    const existingProfile = (await client.query('SELECT id FROM "AcademicProfile" WHERE user_id = $1', ['test-debug-user'])).rows[0];
    console.log("Success", existingProfile);
  } catch (err) {
    console.error("PostgreSQL Error:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

test();
