import excelStorage from '../models/excelStorage.js';
import recipeData from '../models/recipes.js';

class BookmarkController {
  async addBookmark(req, res) {
    try {
      const userId = req.user.userId;
      const { recipeId } = req.body;

      if (!recipeId) {
        return res.status(400).json({ error: 'Recipe ID is required' });
      }

      // Check if recipe exists in our recipe data
      const recipe = recipeData.getRecipeById(recipeId);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Add bookmark using Excel
      const result = await excelStorage.addBookmark(userId, recipeId);
      
      if (!result.success) {
        return res.status(409).json({ error: result.error || 'Recipe already bookmarked' });
      }

      res.status(201).json({ message: 'Recipe bookmarked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to bookmark recipe' });
    }
  }

  async removeBookmark(req, res) {
    try {
      const userId = req.user.userId;
      const { recipeId } = req.params;

      const result = await excelStorage.removeBookmark(userId, recipeId);

      if (!result.success) {
        return res.status(404).json({ error: result.error || 'Bookmark not found' });
      }

      res.json({ message: 'Bookmark removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove bookmark' });
    }
  }

  async getBookmarks(req, res) {
    try {
      const userId = req.user.userId;
      const bookmarks = await excelStorage.getBookmarks(userId);

      // Enrich bookmarks with recipe data
      const enrichedBookmarks = bookmarks.map(bookmark => {
        const recipe = recipeData.getRecipeById(bookmark.recipe_id);
        if (recipe) {
          return {
            id: recipe.id,
            title: recipe.name,
            name: recipe.name,
            description: recipe.description,
            cooking_time: recipe.minutes,
            minutes: recipe.minutes,
            servings: recipe.n_ingredients,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            tags: recipe.tags,
            dietary_tags: recipe.tags || [],
            n_ingredients: recipe.n_ingredients,
            n_steps: recipe.n_steps,
            bookmarked_at: bookmark.bookmarked_at
          };
        }
        return null;
      }).filter(Boolean);

      res.json({ 
        count: enrichedBookmarks.length,
        bookmarks: enrichedBookmarks 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get bookmarks' });
    }
  }

  async checkBookmark(req, res) {
    try {
      const userId = req.user.userId;
      const { recipeId } = req.params;

      const isBookmarked = await excelStorage.checkBookmark(userId, recipeId);

      res.json({ isBookmarked });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check bookmark status' });
    }
  }
}

export default new BookmarkController();

