import express from 'express';
import recommendationController from '../controllers/recommendationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Recommendations require authentication
router.get('/', authenticateToken, recommendationController.getRecommendations.bind(recommendationController));

export default router;

