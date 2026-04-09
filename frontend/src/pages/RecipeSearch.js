import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './RecipeSearch.css';

function RecipeSearch() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [ingredients, setIngredients] = useState('');
  const [savedIngredients, setSavedIngredients] = useState([]);
  const [useOnlySaved, setUseOnlySaved] = useState(false);
  const [filters, setFilters] = useState({
    max_time: '',
    max_ingredients: '',
    exclude_ingredients: ''
  });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Check for quick meals query parameter
    if (searchParams.get('quick') === 'true' && !filters.max_time) {
      setFilters(prev => ({ ...prev, max_time: '30' }));
    }

    if (user) {
      fetchSavedIngredients();
    }
  }, [user, searchParams]);

  const fetchSavedIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setSavedIngredients(response.data.ingredients || []);
    } catch (err) {
      // Ignore error - user might not be logged in
    }
  };

  const useSavedIngredients = () => {
    if (savedIngredients.length > 0) {
      setIngredients(savedIngredients.join(', '));
      setUseOnlySaved(true);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    setHasSearched(true);

    try {
      // If useOnlySaved is true, search only with saved ingredients
      let searchIngredients = '';
      if (useOnlySaved && savedIngredients.length > 0) {
        searchIngredients = savedIngredients.join(', ');
      } else {
        searchIngredients = ingredients.trim();
      }

      // Validate that we have ingredients to search with
      if (!searchIngredients) {
        setError('Please enter ingredients or select "Use only saved ingredients"');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('ingredients', searchIngredients);
      if (useOnlySaved) params.append('use_only_saved', 'true');
      if (filters.max_time) params.append('max_time', filters.max_time);
      if (filters.max_ingredients) params.append('max_ingredients', filters.max_ingredients);
      if (filters.exclude_ingredients) params.append('exclude_ingredients', filters.exclude_ingredients);

      const response = await api.get(`/recipes/search?${params.toString()}`);
      
      if (response.data && response.data.recipes) {
        setRecipes(response.data.recipes || []);
        if (useOnlySaved) {
          setInfo(`Searched using only saved ingredients: ${savedIngredients.join(', ')}`);
        } else {
          setInfo('');
        }
      } else {
        setError('No recipes found. Try different ingredients.');
        setRecipes([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to search recipes. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Find Your Perfect Recipe</h1>
          <p>Enter ingredients you have and discover delicious recipes</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-main">
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="search-input"
                placeholder={useOnlySaved ? `Using saved ingredients: ${savedIngredients.join(', ')}` : "Enter ingredients separated by commas (e.g., chicken, tomatoes, pasta)"}
                value={ingredients}
                onChange={(e) => {
                  setIngredients(e.target.value);
                  if (e.target.value.trim()) {
                    setUseOnlySaved(false);
                  }
                }}
                disabled={useOnlySaved}
                style={{ opacity: useOnlySaved ? 0.7 : 1 }}
              />
              {user && savedIngredients.length > 0 && (
                <button
                  type="button"
                  onClick={useSavedIngredients}
                  className="btn btn-secondary"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.875rem',
                    padding: '0.4rem 0.8rem'
                  }}
                  title="Use your saved ingredients"
                >
                  Use Saved
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Searching...' : 'Search Recipes'}
            </button>
          </div>
          
          {user && savedIngredients.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useOnlySaved}
                  onChange={(e) => {
                    setUseOnlySaved(e.target.checked);
                    if (e.target.checked) {
                      setIngredients(savedIngredients.join(', '));
                    }
                  }}
                />
                <span style={{ fontSize: '0.9rem' }}>Use only saved ingredients</span>
              </label>
              
              <Link to="/ingredients" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.9rem' }}>
                Manage ({savedIngredients.length})
              </Link>
            </div>
          )}

          <details className="filter-toggle">
            <summary>Advanced Filters</summary>
            <div className="filter-group">
              <div className="form-group">
                <label className="form-label">Max Cooking Time (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={filters.max_time}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_time: e.target.value }))}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Ingredients</label>
                <input
                  type="number"
                  className="form-input"
                  value={filters.max_ingredients}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_ingredients: e.target.value }))}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exclude Ingredients</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., nuts, dairy"
                  value={filters.exclude_ingredients}
                  onChange={(e) => setFilters(prev => ({ ...prev, exclude_ingredients: e.target.value }))}
                />
              </div>
            </div>
          </details>
        </form>

        {error && <div className="alert alert-error">{error}</div>}
        {info && <div className="alert alert-info" style={{ background: '#e3f2fd', color: '#1976d2', border: '1px solid #90caf9' }}>{info}</div>}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Finding delicious recipes for you...</p>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="results-section">
            <h2>
              {recipes.length > 0
                ? `Found ${recipes.length} Recipe${recipes.length !== 1 ? 's' : ''}`
                : 'No Recipes Found'}
            </h2>
            
            {recipes.length > 0 ? (
              <div className="recipes-grid">
                {recipes.map(recipe => (
                  <Link 
                    key={recipe.id} 
                    to={`/recipe/${recipe.id}`} 
                    className="recipe-card"
                  >
                    <div className="recipe-content">
                      <h3>{recipe.name || recipe.title}</h3>
                      {recipe.description && <p className="recipe-description">{recipe.description}</p>}
                      <div className="recipe-meta">
                        <span className="recipe-time">⏱️ {recipe.minutes || recipe.cooking_time || 0} min</span>
                        <span className="recipe-ingredients">🥘 {recipe.n_ingredients || (recipe.ingredients?.length || 0)} ingredients</span>
                        <span className="recipe-steps">📝 {recipe.n_steps || (recipe.instructions?.length || 0)} steps</span>
                      </div>
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="recipe-tags">
                          {recipe.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>Try adjusting your search or filters to find more recipes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeSearch;
