import { Router } from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth';

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.post('/predict', authenticate, async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
    res.json(response.data);
  } catch (err: any) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(503).json({ error: 'ML model unavailable. Please check the Python ML service.' });
    }
  }
});

export default router;
