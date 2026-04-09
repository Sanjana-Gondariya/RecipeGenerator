import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExcelStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getFilePath(filename) {
    return path.join(this.dataDir, filename);
  }

  // User Ingredients Management
  async getUserIngredients(userId) {
    const filePath = this.getFilePath('user_ingredients.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Ingredients');
    
    if (!worksheet) {
      return [];
    }

    const ingredients = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const rowUserId = row.getCell(1).value;
        const ingredient = row.getCell(2).value;
        const timestamp = row.getCell(3).value;
        
        if (rowUserId && rowUserId.toString() === userId.toString()) {
          ingredients.push({
            ingredient: ingredient?.toString() || '',
            addedAt: timestamp || new Date()
          });
        }
      }
    });

    return ingredients;
  }

  async addUserIngredient(userId, ingredient) {
    const filePath = this.getFilePath('user_ingredients.xlsx');
    let workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet('Ingredients');
      
      if (!worksheet) {
        worksheet = workbook.addWorksheet('Ingredients');
        worksheet.addRow(['user_id', 'ingredient', 'added_at']);
      }
    } else {
      worksheet = workbook.addWorksheet('Ingredients');
      worksheet.addRow(['user_id', 'ingredient', 'added_at']);
    }

    worksheet.addRow([userId, ingredient, new Date()]);
    await workbook.xlsx.writeFile(filePath);
    
    return { success: true };
  }

  async removeUserIngredient(userId, ingredient) {
    const filePath = this.getFilePath('user_ingredients.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Ingredients');
    
    if (!worksheet) {
      return { success: false, error: 'Worksheet not found' };
    }

    const rowsToDelete = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowUserId = row.getCell(1).value;
        const rowIngredient = row.getCell(2).value;
        
        if (rowUserId && rowUserId.toString() === userId.toString() &&
            rowIngredient && rowIngredient.toString().toLowerCase() === ingredient.toLowerCase()) {
          rowsToDelete.push(rowNumber);
        }
      }
    });

    // Delete rows in reverse order to maintain indices
    rowsToDelete.reverse().forEach(rowNum => {
      worksheet.spliceRows(rowNum, 1);
    });

    await workbook.xlsx.writeFile(filePath);
    return { success: true };
  }

  // Bookmarks Management
  async getBookmarks(userId) {
    const filePath = this.getFilePath('bookmarks.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Bookmarks');
    
    if (!worksheet) {
      return [];
    }

    const bookmarks = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowUserId = row.getCell(1).value;
        const recipeId = row.getCell(2).value;
        const createdAt = row.getCell(3).value;
        
        if (rowUserId && rowUserId.toString() === userId.toString()) {
          bookmarks.push({
            id: recipeId,
            recipe_id: recipeId,
            created_at: createdAt || new Date(),
            bookmarked_at: createdAt || new Date()
          });
        }
      }
    });

    return bookmarks;
  }

  async addBookmark(userId, recipeId) {
    const filePath = this.getFilePath('bookmarks.xlsx');
    let workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet('Bookmarks');
      
      if (!worksheet) {
        worksheet = workbook.addWorksheet('Bookmarks');
        worksheet.addRow(['user_id', 'recipe_id', 'created_at']);
      } else {
        // Check if bookmark already exists
        let exists = false;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowUserId = row.getCell(1).value;
            const rowRecipeId = row.getCell(2).value;
            
            if (rowUserId && rowUserId.toString() === userId.toString() &&
                rowRecipeId && rowRecipeId.toString() === recipeId.toString()) {
              exists = true;
            }
          }
        });
        
        if (exists) {
          return { success: false, error: 'Recipe already bookmarked' };
        }
      }
    } else {
      worksheet = workbook.addWorksheet('Bookmarks');
      worksheet.addRow(['user_id', 'recipe_id', 'created_at']);
    }

    worksheet.addRow([userId, recipeId, new Date()]);
    await workbook.xlsx.writeFile(filePath);
    
    return { success: true };
  }

  async removeBookmark(userId, recipeId) {
    const filePath = this.getFilePath('bookmarks.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Bookmarks');
    
    if (!worksheet) {
      return { success: false, error: 'Worksheet not found' };
    }

    let found = false;
    const rowsToDelete = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowUserId = row.getCell(1).value;
        const rowRecipeId = row.getCell(2).value;
        
        if (rowUserId && rowUserId.toString() === userId.toString() &&
            rowRecipeId && rowRecipeId.toString() === recipeId.toString()) {
          rowsToDelete.push(rowNumber);
          found = true;
        }
      }
    });

    if (!found) {
      return { success: false, error: 'Bookmark not found' };
    }

    // Delete rows in reverse order
    rowsToDelete.reverse().forEach(rowNum => {
      worksheet.spliceRows(rowNum, 1);
    });

    await workbook.xlsx.writeFile(filePath);
    return { success: true };
  }

  async checkBookmark(userId, recipeId) {
    const bookmarks = await this.getBookmarks(userId);
    return bookmarks.some(b => b.recipe_id && b.recipe_id.toString() === recipeId.toString());
  }

  // User Preferences Management
  async getUserPreferences(userId) {
    const filePath = this.getFilePath('user_preferences.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Preferences');
    
    if (!worksheet) {
      return null;
    }

    let preferences = null;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowUserId = row.getCell(1).value;
        
        if (rowUserId && rowUserId.toString() === userId.toString()) {
          preferences = {
            user_id: userId,
            dietary_restrictions: this.parseArray(row.getCell(2).value),
            allergies: this.parseArray(row.getCell(3).value),
            cooking_time_preference: row.getCell(4).value,
            cuisine_preferences: this.parseArray(row.getCell(5).value),
            goals: this.parseArray(row.getCell(6).value),
            created_at: row.getCell(7).value,
            updated_at: row.getCell(8).value
          };
        }
      }
    });

    return preferences;
  }

  async saveUserPreferences(userId, preferences) {
    const filePath = this.getFilePath('user_preferences.xlsx');
    let workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet('Preferences');
      
      if (!worksheet) {
        worksheet = workbook.addWorksheet('Preferences');
        worksheet.addRow(['user_id', 'dietary_restrictions', 'allergies', 'cooking_time_preference', 'cuisine_preferences', 'goals', 'created_at', 'updated_at']);
      } else {
        // Check if preferences exist and update
        let found = false;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowUserId = row.getCell(1).value;
            
            if (rowUserId && rowUserId.toString() === userId.toString()) {
              // Update existing row
              row.getCell(2).value = this.arrayToString(preferences.dietary_restrictions);
              row.getCell(3).value = this.arrayToString(preferences.allergies);
              row.getCell(4).value = preferences.cooking_time_preference;
              row.getCell(5).value = this.arrayToString(preferences.cuisine_preferences);
              row.getCell(6).value = this.arrayToString(preferences.goals);
              row.getCell(8).value = new Date();
              found = true;
            }
          }
        });
        
        if (found) {
          await workbook.xlsx.writeFile(filePath);
          return { success: true };
        }
      }
    } else {
      worksheet = workbook.addWorksheet('Preferences');
      worksheet.addRow(['user_id', 'dietary_restrictions', 'allergies', 'cooking_time_preference', 'cuisine_preferences', 'goals', 'created_at', 'updated_at']);
    }

    // Add new preferences
    worksheet.addRow([
      userId,
      this.arrayToString(preferences.dietary_restrictions),
      this.arrayToString(preferences.allergies),
      preferences.cooking_time_preference,
      this.arrayToString(preferences.cuisine_preferences),
      this.arrayToString(preferences.goals),
      new Date(),
      new Date()
    ]);

    await workbook.xlsx.writeFile(filePath);
    return { success: true };
  }

  // Users Management (for auth - still needed for user identification)
  async getUserByEmail(email) {
    const filePath = this.getFilePath('users.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet('Users');
      
      if (!worksheet) {
        return null;
      }

      let user = null;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowEmail = row.getCell(2).value;
          
          if (rowEmail && rowEmail.toString().toLowerCase() === email.toLowerCase()) {
            user = {
              id: row.getCell(1).value,
              email: row.getCell(2).value,
              password_hash: row.getCell(3).value,
              username: row.getCell(4).value,
              created_at: row.getCell(5).value
            };
          }
        }
      });

      return user;
    } catch (error) {
      console.error('Error reading users file:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    const filePath = this.getFilePath('users.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Users');
    
    if (!worksheet) {
      return null;
    }

    let user = null;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowUserId = row.getCell(1).value;
        
        if (rowUserId && rowUserId.toString() === userId.toString()) {
          user = {
            id: row.getCell(1).value,
            email: row.getCell(2).value,
            password_hash: row.getCell(3).value,
            username: row.getCell(4).value,
            created_at: row.getCell(5).value
          };
        }
      }
    });

    return user;
  }

  async createUser(user) {
    const filePath = this.getFilePath('users.xlsx');
    let workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet('Users');
      
      if (!worksheet) {
        worksheet = workbook.addWorksheet('Users');
        worksheet.addRow(['id', 'email', 'password_hash', 'username', 'created_at']);
      } else {
        // Check if user already exists
        let exists = false;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1 && !exists) {
            const rowEmail = row.getCell(2).value;
            if (rowEmail && rowEmail.toString().toLowerCase() === user.email.toLowerCase()) {
              exists = true;
            }
          }
        });
        
        if (exists) {
          return { success: false, error: 'User with this email already exists' };
        }
      }
    } else {
      worksheet = workbook.addWorksheet('Users');
      worksheet.addRow(['id', 'email', 'password_hash', 'username', 'created_at']);
    }

    // Get next ID
    let nextId = 1;
    if (worksheet.rowCount > 1) {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const id = row.getCell(1).value;
          if (id && parseInt(id) >= nextId) {
            nextId = parseInt(id) + 1;
          }
        }
      });
    }

    try {
      worksheet.addRow([nextId, user.email, user.password_hash, user.username, new Date()]);
      await workbook.xlsx.writeFile(filePath);
      
      return { success: true, userId: nextId };
    } catch (writeError) {
      console.error('Error writing to Excel file:', writeError);
      throw new Error(`Failed to save user to Excel: ${writeError.message}`);
    }
  }

  // Helper methods
  arrayToString(arr) {
    if (!arr || !Array.isArray(arr)) {
      return '';
    }
    return arr.join(',');
  }

  parseArray(str) {
    if (!str || typeof str !== 'string') {
      return [];
    }
    return str.split(',').map(item => item.trim()).filter(Boolean);
  }
}

export default new ExcelStorage();
