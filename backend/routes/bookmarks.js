import express from 'express';
import bookmarkController from '../controllers/bookmarkController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All bookmark routes require authentication
router.post('/', authenticateToken, bookmarkController.addBookmark.bind(bookmarkController));
router.delete('/:recipeId', authenticateToken, bookmarkController.removeBookmark.bind(bookmarkController));
router.get('/', authenticateToken, bookmarkController.getBookmarks.bind(bookmarkController));
router.get('/check/:recipeId', authenticateToken, bookmarkController.checkBookmark.bind(bookmarkController));

export default router;

