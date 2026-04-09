import excelStorage from '../models/excelStorage.js';

class IngredientsController {
  async getUserIngredients(req, res) {
    try {
      const userId = req.user.userId;
      const ingredients = await excelStorage.getUserIngredients(userId);
      
      res.json({
        count: ingredients.length,
        ingredients: ingredients.map(item => item.ingredient)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get ingredients' });
    }
  }

  async addIngredient(req, res) {
    try {
      const userId = req.user.userId;
      const { ingredient } = req.body;

      if (!ingredient || !ingredient.trim()) {
        return res.status(400).json({ error: 'Ingredient is required' });
      }

      const result = await excelStorage.addUserIngredient(userId, ingredient.trim());
      
      if (!result.success) {
        return res.status(500).json({ error: result.error || 'Failed to add ingredient' });
      }

      res.status(201).json({ message: 'Ingredient added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add ingredient' });
    }
  }

  async removeIngredient(req, res) {
    try {
      const userId = req.user.userId;
      const { ingredient } = req.body;

      if (!ingredient) {
        return res.status(400).json({ error: 'Ingredient is required' });
      }

      const result = await excelStorage.removeUserIngredient(userId, ingredient);
      
      if (!result.success) {
        return res.status(404).json({ error: result.error || 'Ingredient not found' });
      }

      res.json({ message: 'Ingredient removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove ingredient' });
    }
  }
}

export default new IngredientsController();
