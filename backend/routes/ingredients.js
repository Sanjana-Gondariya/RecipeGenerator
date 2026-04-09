import express from 'express';
import ingredientsController from '../controllers/ingredientsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All ingredient routes require authentication
router.get('/', authenticateToken, ingredientsController.getUserIngredients.bind(ingredientsController));
router.post('/', authenticateToken, ingredientsController.addIngredient.bind(ingredientsController));
router.delete('/', authenticateToken, ingredientsController.removeIngredient.bind(ingredientsController));

export default router;
