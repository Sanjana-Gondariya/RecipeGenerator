import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Recommendations.css';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/recommendations');
      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      }
      if (response.data.message) {
        setMessage(response.data.message);
      }
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: 'white', marginTop: '1rem' }}>Getting personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="container">
        <div className="page-header">
          <h1>Recommendations</h1>
          <p>Personalized recipe suggestions based on your bookmarked recipes</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {message && (
          <div className="alert alert-info">
            <p>{message}</p>
          </div>
        )}

        {recommendations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h2>No recommendations yet</h2>
            <p>Start bookmarking recipes to get personalized suggestions!</p>
            <Link to="/search" className="btn btn-primary">
              Explore Recipes
            </Link>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((recipe, index) => (
              <div key={index} className="recommendation-card">
                <h3>{recipe.title || 'Recommended Recipe'}</h3>
                
                {recipe.description && (
                  <p className="recipe-description">{recipe.description}</p>
                )}

                {recipe.recommended_ingredients && (
                  <div className="ingredients">
                    <strong>Recommended Ingredients:</strong>
                    <ul>
                      {recipe.recommended_ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.cooking_time && (
                  <div className="recipe-meta">
                    <span>⏱️ {recipe.cooking_time} minutes</span>
                  </div>
                )}

                {recipe.reason_for_recommendation && (
                  <div className="recommendation-reason">
                    <strong>💡 Why we recommend this:</strong>
                    <p>{recipe.reason_for_recommendation}</p>
                  </div>
                )}

                <button className="btn btn-primary btn-sm mt-2">
                  <Link to="/search" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Find Similar Recipes
                  </Link>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;

