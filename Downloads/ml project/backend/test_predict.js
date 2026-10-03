const jwt = require('jsonwebtoken');
const axios = require('axios');

const token = jwt.sign({ id: 'testuser' }, 'fallback_secret');

const data = {
  "age": 22,
  "gender": "Female",
  "quiz1_marks": 7.3,
  "quiz2_marks": 5.8,
  "quiz3_marks": 5.6,
  "total_assignments": 5,
  "midterm_marks": 21.35,
  "previous_gpa": 2.8,
  "total_lectures": 12,
  "lectures_attended": 6,
  "total_lab_sessions": 6,
  "labs_attended": 3
};

axios.post('http://localhost:5000/api/ml/predict', data, {
    headers: { Authorization: `Bearer ${token}` }
}).then(res => {
    console.log('PREDICTION_RESULT:', res.data);
    process.exit(0);
}).catch(err => {
    console.error('PREDICTION_ERROR:', err.response ? err.response.data : err.message);
    process.exit(1);
});
