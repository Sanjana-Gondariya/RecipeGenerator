import express from 'express';
import recipeController from '../controllers/recipeController.js';

const router = express.Router();

router.get('/search', recipeController.searchRecipes.bind(recipeController));
router.get('/all', recipeController.getAllRecipes.bind(recipeController));
router.get('/:id', recipeController.getRecipeById.bind(recipeController));

export default router;

