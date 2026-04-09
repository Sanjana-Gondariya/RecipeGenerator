import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes
router.post('/preferences', authenticateToken, authController.updatePreferences.bind(authController));
router.get('/preferences', authenticateToken, authController.getPreferences.bind(authController));

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const excelStorage = (await import('../models/excelStorage.js')).default;
    const user = await excelStorage.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
