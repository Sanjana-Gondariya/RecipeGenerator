import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Onboarding.css';

function Onboarding() {
  const { updatePreferences } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    dietary_restrictions: [],
    allergies: [],
    cooking_time_preference: '',
    cuisine_preferences: [],
    goals: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await updatePreferences(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Let's personalize your experience!</h1>
          <p>Tell us about your preferences to get the best recipe recommendations</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-section">
            <h2>Dietary Restrictions</h2>
            <div className="checkbox-group">
              {['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 'low-carb'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.dietary_restrictions.includes(option)}
                    onChange={() => handleCheckboxChange('dietary_restrictions', option)}
                  />
                  <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Allergies</h2>
            <div className="checkbox-group">
              {['peanuts', 'tree nuts', 'dairy', 'eggs', 'shellfish', 'soy', 'wheat', 'fish'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allergies.includes(option)}
                    onChange={() => handleCheckboxChange('allergies', option)}
                  />
                  <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Preferred Cooking Time (minutes)</h2>
            <select
              className="form-select"
              value={formData.cooking_time_preference}
              onChange={(e) => setFormData(prev => ({ ...prev, cooking_time_preference: parseInt(e.target.value) }))}
              required
            >
              <option value="">Select time...</option>
              <option value="15">15 minutes or less</option>
              <option value="30">30 minutes or less</option>
              <option value="45">45 minutes or less</option>
              <option value="60">1 hour or less</option>
              <option value="999">No preference</option>
            </select>
          </div>

          <div className="form-section">
            <h2>Cuisine Preferences</h2>
            <div className="checkbox-group">
              {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian', 'French', 'Thai'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.cuisine_preferences.includes(option)}
                    onChange={() => handleCheckboxChange('cuisine_preferences', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Your Goals</h2>
            <div className="checkbox-group">
              {['reduce waste', 'eat healthier', 'save money', 'try new recipes', 'meal prep', 'quick meals'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(option)}
                    onChange={() => handleCheckboxChange('goals', option)}
                  />
                  <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving preferences...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;

