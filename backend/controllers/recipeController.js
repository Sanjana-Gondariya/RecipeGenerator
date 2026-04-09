import recipeData from '../models/recipes.js';

class RecipeController {
  async searchRecipes(req, res) {
    try {
      // Ensure recipes are loaded
      await recipeData.loadRecipes();

      const { ingredients, max_time, max_ingredients, exclude_ingredients, use_only_saved } = req.query;

      const filters = {};
      if (ingredients) filters.ingredients = ingredients;
      if (max_time) filters.max_time = max_time;
      if (max_ingredients) filters.max_ingredients = max_ingredients;
      if (exclude_ingredients) filters.exclude_ingredients = exclude_ingredients;
      if (use_only_saved) filters.use_only_saved = use_only_saved;

      const recipes = recipeData.searchRecipes(filters);

      // Limit results to prevent overwhelming the client
      const limitedRecipes = recipes.slice(0, 100);

      res.json({ 
        count: limitedRecipes.length,
        total: recipes.length,
        recipes: limitedRecipes
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to search recipes' });
    }
  }

  async getRecipeById(req, res) {
    try {
      // Ensure recipes are loaded
      await recipeData.loadRecipes();

      const { id } = req.params;
      const recipe = recipeData.getRecipeById(id);

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.json({ recipe });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get recipe' });
    }
  }

  async getAllRecipes(req, res) {
    try {
      const recipes = recipeData.getAllRecipes();

      res.json({ 
        count: recipes.length,
        recipes: recipes
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get recipes' });
    }
  }
}

export default new RecipeController();
