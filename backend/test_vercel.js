const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'a7e77fb23650b667ecfabebf3a73ef381c6f860ee8bb2af3a56ae54a47e02fe5';

async function test() {
  const token = jwt.sign({ id: 'test-debug-user' }, JWT_SECRET, { expiresIn: '7d' });

  console.log("Testing POST /api/profile on Vercel...");
  try {
    const res = await axios.post('https://backend-pied-six-74.vercel.app/api/profile', {
      name: 'Test Debug',
      gender: 'Male',
      university: 'VIT Chennai',
      degree: 'Bachelor of Technology',
      specialization: 'Computer Science and Engineering',
      total_semesters: '10',
      expected_grad_year: '2030',
      total_program_credits: '200',
      completed_semesters: '2',
      grading_system: '10',
      current_semester: 3,
      semesters: [
        { semester_number: 1, gpa: 8.5, credits: 20 },
        { semester_number: 2, gpa: 9.0, credits: 22 }
      ]
    }, {
       headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success!", res.data);
  } catch(e) {
    console.error("Failed:", e.response?.status, e.response?.data);
  }
}

test();
