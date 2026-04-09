import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './RecipeDetail.css';

function RecipeDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    fetchRecipe();
    if (user) {
      checkBookmark();
    }
  }, [id, user]);

  const fetchRecipe = async () => {
    try {
      const response = await api.get(`/recipes/${id}`);
      setRecipe(response.data.recipe);
    } catch (err) {
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await api.get(`/bookmarks/check/${id}`);
      setIsBookmarked(response.data.isBookmarked);
    } catch (err) {
      // If user is not logged in, ignore the error
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please login to bookmark recipes');
      return;
    }

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
      } else {
        await api.post('/bookmarks', { recipeId: id });
        setIsBookmarked(true);
      }
    } catch (err) {
      alert('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="error-container">
        <p>{error || 'Recipe not found'}</p>
        <Link to="/search" className="btn btn-primary">Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <div className="container">
        <Link to="/search" className="back-link">← Back to Search</Link>
        
        <div className="recipe-header">
          <div className="recipe-title-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1>{recipe.name}</h1>
              {user && (
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className="btn btn-primary"
                  style={{ marginLeft: '1rem', minWidth: '120px' }}
                >
                  {bookmarkLoading ? '...' : isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                </button>
              )}
            </div>
            <p className="recipe-description">{recipe.description}</p>
            <div className="recipe-meta">
              <span>⏱️ {recipe.minutes || recipe.cooking_time || 0} min</span>
              <span>📝 {recipe.n_steps || (recipe.instructions?.length || 0)} steps</span>
              <span>🥘 {recipe.n_ingredients || (recipe.ingredients?.length || 0)} ingredients</span>
              {recipe.servings && <span>👥 {recipe.servings} servings</span>}
              {recipe.difficulty && <span>⚙️ {recipe.difficulty}</span>}
            </div>
          </div>
        </div>

        <div className="recipe-content">
          <div className="recipe-section">
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h2>Instructions</h2>
            <div className="instructions">
              {(recipe.steps || recipe.instructions || []).map((step, index) => (
                <div key={index} className="instruction-step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {recipe.tips && (
            <div className="recipe-section">
              <h2>Tips</h2>
              <p style={{ fontStyle: 'italic', color: '#666' }}>{recipe.tips}</p>
            </div>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="recipe-section">
              <h2>Tags</h2>
              <div className="tags">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
