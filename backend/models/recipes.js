import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RecipeData {
  constructor() {
    this.recipes = [];
    this.loaded = false;
  }

  async loadRecipes() {
    if (this.loaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      const results = [];
      
      const csvPath = path.join(__dirname, '../data/recipes.csv');
      
      // Check if file exists
      if (!fs.existsSync(csvPath)) {
        console.warn(`Recipe CSV file not found at ${csvPath}. Starting with empty recipe list.`);
        this.recipes = [];
        this.loaded = true;
        resolve();
        return;
      }

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            let recipe;
            
            // Check if this is the archive format (has recipe_name) or original format (has name/id)
            if (row.recipe_name || row.Name) {
              // Archive format: recipe_name, total_time, ingredients (comma-separated), directions
              const recipeName = row.recipe_name || row.Name || '';
              const totalTime = row.total_time || row['Total Time'] || '';
              const ingredientsStr = row.ingredients || '';
              const directionsStr = row.directions || row.Directions || '';
              
              // Parse time string (e.g., "1 hrs 30 mins" or "40 mins") to minutes
              const minutes = this.parseTimeToMinutes(totalTime);
              
              // Parse ingredients from comma-separated string to array
              const ingredients = this.parseIngredientsString(ingredientsStr);
              
              // Parse directions to steps array
              const steps = this.parseDirectionsToSteps(directionsStr);
              
              recipe = {
                id: results.length + 1, // Generate ID from index
                name: recipeName,
                minutes: minutes,
                n_steps: steps.length,
                steps: steps,
                description: row.description || '',
                ingredients: ingredients,
                n_ingredients: ingredients.length,
                tags: [],
                nutrition: []
              };
            } else {
              // Original format: id, name, minutes, steps, ingredients (as arrays)
              recipe = {
                id: parseInt(row.id) || results.length + 1,
                name: row.name || '',
                minutes: parseInt(row.minutes) || 0,
                n_steps: parseInt(row.n_steps) || 0,
                steps: this.parseArray(row.steps),
                description: row.description || '',
                ingredients: this.parseArray(row.ingredients),
                n_ingredients: parseInt(row.n_ingredients) || 0,
                tags: this.parseArray(row.tags),
                nutrition: this.parseArray(row.nutrition)
              };
            }
            
            if (recipe.name && recipe.ingredients && recipe.ingredients.length > 0) {
              results.push(recipe);
            }
          } catch (error) {
            console.error('Error parsing recipe:', error);
          }
        })
        .on('end', () => {
          this.recipes = results;
          this.loaded = true;
          resolve();
        })
        .on('error', (error) => {
          console.error('Error loading recipes:', error);
          // Don't reject - just start with empty recipes
          console.warn('Starting server with empty recipe list due to loading error');
          this.recipes = [];
          this.loaded = true;
          resolve();
        });
    });
  }

  parseArray(str) {
    if (!str) return [];
    try {
      // Parse arrays like "['item1', 'item2']"
      return JSON.parse(str.replace(/'/g, '"'));
    } catch (error) {
      return [];
    }
  }

  parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    let totalMinutes = 0;
    
    // Match hours: "1 hrs" or "1 hr"
    const hoursMatch = timeStr.match(/(\d+)\s*(?:hrs?|hours?)/i);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    // Match minutes: "30 mins" or "30 min"
    const minsMatch = timeStr.match(/(\d+)\s*(?:mins?|minutes?)/i);
    if (minsMatch) {
      totalMinutes += parseInt(minsMatch[1]);
    }
    
    return totalMinutes || 0;
  }

  parseIngredientsString(ingredientsStr) {
    if (!ingredientsStr) return [];
    
    // Try to parse as JSON array first (for test_recipes.csv format)
    try {
      const parsed = JSON.parse(ingredientsStr);
      if (Array.isArray(parsed)) {
        // Extract ingredient names from objects like {quantity: '2', unit: 'cups', name: 'flour'}
        return parsed.map(item => {
          if (typeof item === 'string') return item;
          if (item.name) return item.name;
          return JSON.stringify(item);
        });
      }
    } catch (e) {
      // Not JSON, parse as comma-separated string
    }
    
    // Parse comma-separated ingredients string
    // Split by commas, but be careful with commas inside parentheses
    const ingredients = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < ingredientsStr.length; i++) {
      const char = ingredientsStr[i];
      if (char === '(' || char === '[') depth++;
      else if (char === ')' || char === ']') depth--;
      else if (char === ',' && depth === 0) {
        const trimmed = current.trim();
        if (trimmed) ingredients.push(trimmed);
        current = '';
        continue;
      }
      current += char;
    }
    
    if (current.trim()) ingredients.push(current.trim());
    
    return ingredients.filter(ing => ing.length > 0);
  }

  parseDirectionsToSteps(directionsStr) {
    if (!directionsStr) return [];
    
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(directionsStr);
      if (Array.isArray(parsed)) {
        return parsed.filter(step => typeof step === 'string' && step.trim().length > 0);
      }
    } catch (e) {
      // Not JSON, parse as text
    }
    
    // Split by periods followed by space or newline, or by numbered steps
    // First try to split by numbered steps (1., 2., etc.)
    const numberedMatch = directionsStr.match(/^\d+\./);
    if (numberedMatch) {
      const steps = directionsStr.split(/\d+\.\s*/).filter(s => s.trim().length > 0);
      return steps.map(s => s.trim());
    }
    
    // Otherwise split by periods followed by space/newline
    const steps = directionsStr
      .split(/\.\s+(?=[A-Z])|\.\n+/)
      .map(s => s.trim().replace(/\.$/, ''))
      .filter(s => s.length > 0);
    
    return steps.length > 0 ? steps : [directionsStr];
  }

  searchRecipes(filters = {}) {
    const { ingredients, max_time, max_ingredients, exclude_ingredients, use_only_saved } = filters;
    
    // Ensure recipes are loaded
    if (!this.loaded || this.recipes.length === 0) {
      console.warn('Recipes not loaded yet');
      return [];
    }
    
    let results = [...this.recipes];

    // Filter by ingredients
    if (ingredients && ingredients.trim()) {
      const searchTerms = Array.isArray(ingredients) 
        ? ingredients 
        : ingredients.split(/[\s,]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
      
      if (searchTerms.length > 0) {
        if (use_only_saved === 'true' || use_only_saved === true) {
          // Strict mode: Recipe must primarily use ONLY the saved ingredients
          // Find recipes where all recipe ingredients are found in the search terms (saved ingredients)
          results = results.filter(recipe => {
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
              return false;
            }
            
            // Get all recipe ingredients as lowercase terms
            const recipeIngTerms = recipe.ingredients.map(ing => {
              // Extract base ingredient name (remove quantities, units, etc.)
              return ing.toLowerCase().replace(/[\d.,\/\s]+(cup|tbsp|tsp|oz|lb|gram|kg|ml|l|clove|piece|slice|can|package|packet|bunch|head|stalk|teaspoon|tablespoon|ounce|pound|gram|kilogram|milliliter|liter|whole|diced|chopped|sliced|minced|grated|peeled|seeded|stemmed|trimmed|halved|quartered|crushed|ground|powder|fresh|frozen|dried|canned|jar|bottle|box|bag|strip|sprig|leaf|leaves)/g, '').trim();
            }).filter(Boolean);
            
            // Check if ALL recipe ingredients are found in saved ingredients
            // Allow some flexibility for common words
            const commonWords = ['salt', 'pepper', 'water', 'oil', 'butter', 'sugar', 'flour'];
            const allFound = recipeIngTerms.every(recipeIng => {
              // Skip very short or common words
              if (recipeIng.length < 3 || commonWords.includes(recipeIng)) {
                return true;
              }
              // Check if this recipe ingredient matches any saved ingredient
              return searchTerms.some(savedIng => {
                const savedIngClean = savedIng.toLowerCase();
                // Check for exact match or substring match (saved ingredient contains recipe ingredient or vice versa)
                return recipeIng.includes(savedIngClean) || savedIngClean.includes(recipeIng) || 
                       recipeIng === savedIngClean || savedIngClean === recipeIng;
              });
            });
            
            // Also require that at least some saved ingredients are actually used
            const hasMatches = recipeIngTerms.some(recipeIng => 
              searchTerms.some(savedIng => {
                const savedIngClean = savedIng.toLowerCase();
                return recipeIng.includes(savedIngClean) || savedIngClean.includes(recipeIng) || 
                       recipeIng === savedIngClean || savedIngClean === recipeIng;
              })
            );
            
            return allFound && hasMatches;
          });
        } else {
          // Normal mode: Recipe contains ANY of the search terms
          results = results.filter(recipe => {
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
              return false;
            }
            const recipeIngredients = recipe.ingredients.join(' ').toLowerCase();
            return searchTerms.some(term => recipeIngredients.includes(term));
          });
        }
      }
    }

    // Filter by max time
    if (max_time) {
      const maxTime = parseInt(max_time);
      results = results.filter(recipe => recipe.minutes <= maxTime);
    }

    // Filter by max ingredients
    if (max_ingredients) {
      const maxIng = parseInt(max_ingredients);
      results = results.filter(recipe => recipe.n_ingredients <= maxIng);
    }

    // Exclude ingredients
    if (exclude_ingredients) {
      const excludeList = Array.isArray(exclude_ingredients)
        ? exclude_ingredients
        : exclude_ingredients.split(',').map(i => i.trim().toLowerCase());
      
      results = results.filter(recipe => {
        const recipeIngredients = recipe.ingredients.join(' ').toLowerCase();
        return !excludeList.some(excluded => recipeIngredients.includes(excluded));
      });
    }

    return results;
  }

  getRecipeById(id) {
    return this.recipes.find(recipe => recipe.id === parseInt(id));
  }

  getAllRecipes() {
    return this.recipes;
  }
}

export default new RecipeData();

