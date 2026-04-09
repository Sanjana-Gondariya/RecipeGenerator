import excelStorage from '../models/excelStorage.js';
import recipeData from '../models/recipes.js';

class RecommendationController {
  async getRecommendations(req, res) {
    try {
      const userId = req.user.userId;

      // Get user's bookmarked recipes
      const bookmarks = await excelStorage.getBookmarks(userId);

      // If no bookmarks, return popular recipes
      if (bookmarks.length === 0) {
        const allRecipes = recipeData.getAllRecipes();
        const popularRecipes = allRecipes.slice(0, 5).map(recipe => ({
          title: recipe.name,
          description: recipe.description,
          recommended_ingredients: recipe.ingredients,
          cooking_time: recipe.minutes,
          reason_for_recommendation: 'Popular recipe from our collection'
        }));
        return res.json({
          message: 'Please bookmark some recipes to get personalized recommendations',
          recommendations: popularRecipes
        });
      }

      // Get bookmarked recipes and find similar recipes
      const bookmarkedRecipes = bookmarks.map(bookmark => {
        const recipe = recipeData.getRecipeById(bookmark.recipe_id);
        return recipe;
      }).filter(Boolean);

      // Get all recipes and find similar ones based on shared ingredients
      const allRecipes = recipeData.getAllRecipes();
      const recommendations = [];
      const bookmarkedIds = new Set(bookmarks.map(b => b.recipe_id.toString()));

      // Find recipes with similar ingredients to bookmarked recipes
      for (const bookmarkedRecipe of bookmarkedRecipes) {
        if (!bookmarkedRecipe.ingredients || bookmarkedRecipe.ingredients.length === 0) continue;

        const bookmarkedIngs = new Set(
          bookmarkedRecipe.ingredients.map(ing => ing.toLowerCase().trim())
        );

        for (const recipe of allRecipes) {
          // Skip if already bookmarked
          if (bookmarkedIds.has(recipe.id.toString())) continue;
          
          // Skip if already in recommendations
          if (recommendations.some(r => r.id === recipe.id)) continue;

          if (recipe.ingredients && recipe.ingredients.length > 0) {
            const recipeIngs = new Set(
              recipe.ingredients.map(ing => ing.toLowerCase().trim())
            );
            
            // Count shared ingredients
            const sharedIngredients = [...bookmarkedIngs].filter(ing => recipeIngs.has(ing));
            
            // If at least 2 ingredients match, recommend it
            if (sharedIngredients.length >= 2) {
              recommendations.push({
                id: recipe.id,
                title: recipe.name,
                description: recipe.description,
                recommended_ingredients: recipe.ingredients,
                cooking_time: recipe.minutes,
                reason_for_recommendation: `Similar to "${bookmarkedRecipe.name}" (shares ${sharedIngredients.length} ingredients)`
              });
            }
          }
        }
      }

      // If we don't have enough recommendations, add some popular recipes
      if (recommendations.length < 5) {
        const popularRecipes = allRecipes
          .filter(r => !bookmarkedIds.has(r.id.toString()) && !recommendations.some(rec => rec.id === r.id))
          .slice(0, 5 - recommendations.length)
          .map(recipe => ({
            id: recipe.id,
            title: recipe.name,
            description: recipe.description,
            recommended_ingredients: recipe.ingredients,
            cooking_time: recipe.minutes,
            reason_for_recommendation: 'Popular recipe from our collection'
          }));
        recommendations.push(...popularRecipes);
      }

      res.json({
        based_on: bookmarkedRecipes.length,
        recommendations: recommendations.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
}

export default new RecommendationController();

