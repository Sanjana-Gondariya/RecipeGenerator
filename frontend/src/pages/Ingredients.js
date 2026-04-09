import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Ingredients.css';

function Ingredients() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchIngredients();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data.ingredients || []);
    } catch (err) {
      setError('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    
    if (!newIngredient.trim()) {
      return;
    }

    if (!user) {
      alert('Please login to manage your ingredients');
      return;
    }

    setAdding(true);
    setError('');

    try {
      await api.post('/ingredients', { ingredient: newIngredient.trim() });
      setNewIngredient('');
      fetchIngredients();
    } catch (err) {
      setError('Failed to add ingredient');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveIngredient = async (ingredient) => {
    if (!user) {
      return;
    }

    try {
      await api.delete('/ingredients', { data: { ingredient } });
      fetchIngredients();
    } catch (err) {
      alert('Failed to remove ingredient');
    }
  };

  if (!user) {
    return (
      <div className="ingredients-page">
        <div className="container">
          <div className="page-header">
            <h1>My Ingredients</h1>
            <p>Please login to manage your ingredients</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="ingredients-page">
      <div className="container">
        <div className="page-header">
          <h1>My Ingredients</h1>
          <p>Manage the ingredients you have in your pantry</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleAddIngredient} className="add-ingredient-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Enter ingredient name (e.g., chicken, tomatoes, pasta)"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              disabled={adding}
            />
            <button type="submit" className="btn btn-primary" disabled={adding || !newIngredient.trim()}>
              {adding ? 'Adding...' : 'Add Ingredient'}
            </button>
          </div>
        </form>

        <div className="ingredients-section">
          <h2>
            Your Ingredients ({ingredients.length})
          </h2>

          {ingredients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🥘</div>
              <h3>No ingredients yet</h3>
              <p>Start adding ingredients to your pantry!</p>
            </div>
          ) : (
            <div className="ingredients-grid">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-card">
                  <span className="ingredient-name">{ingredient}</span>
                  <button
                    onClick={() => handleRemoveIngredient(ingredient)}
                    className="remove-ingredient-btn"
                    title="Remove ingredient"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ingredients;
