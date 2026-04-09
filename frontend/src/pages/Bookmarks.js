import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Bookmarks.css';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/bookmarks');
      setBookmarks(response.data.bookmarks);
    } catch (err) {
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (recipeId) => {
    try {
      await api.delete(`/bookmarks/${recipeId}`);
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== recipeId));
    } catch (err) {
      alert('Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookmarks</h1>
          <p>Your saved recipes</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h2>No bookmarks yet</h2>
            <p>Start saving your favorite recipes!</p>
            <Link to="/search" className="btn btn-primary">
              Explore Recipes
            </Link>
          </div>
        ) : (
          <>
            <div className="bookmarks-count">
              <p>{bookmarks.length} saved recipe{bookmarks.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="bookmarks-grid">
              {bookmarks.map(recipe => (
                <div key={recipe.id} className="bookmark-card">
                  <Link to={`/recipe/${recipe.id}`}>
                    {recipe.image_url && (
                      <div className="recipe-image" style={{ backgroundImage: `url(${recipe.image_url})` }} />
                    )}
                    <div className="recipe-content">
                      <h3>{recipe.title}</h3>
                      {recipe.description && <p>{recipe.description}</p>}
                      <div className="recipe-meta">
                        <span>⏱️ {recipe.cooking_time} min</span>
                        <span>👥 {recipe.servings} servings</span>
                      </div>
                      {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                        <div className="recipe-tags">
                          {recipe.dietary_tags.slice(0, 2).map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveBookmark(recipe.id)}
                    className="remove-bookmark-btn"
                    title="Remove bookmark"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;

