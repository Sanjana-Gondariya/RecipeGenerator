import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recipeRoutes from './routes/recipes.js';
import bookmarkRoutes from './routes/bookmarks.js';
import recommendationRoutes from './routes/recommendations.js';
import authRoutes from './routes/auth.js';
import ingredientsRoutes from './routes/ingredients.js';
import recipeData from './models/recipes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Food Waste Saver API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize recipe data and start server
async function startServer() {
  try {
    await recipeData.loadRecipes();
    console.log('Recipe data loaded successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
