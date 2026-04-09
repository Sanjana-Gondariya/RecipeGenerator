import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Reduce Food Waste, <br />
            One Recipe at a Time
          </h1>
          <p className="hero-description">
            Transform your pantry into delicious meals with smart recipe recommendations.
            Save money, reduce waste, and discover amazing recipes.
          </p>
          <div className="hero-buttons">
            <Link to="/search" className="btn btn-primary btn-lg">
              Find Recipes
            </Link>
            <Link to="/ingredients" className="btn btn-secondary btn-lg">
              Manage Ingredients
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="feature-cards-grid">
            <Link to="/search" className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Find recipes based on ingredients you have</p>
            </Link>
            <Link to="/search" className="feature-card">
              <div className="feature-icon">🔖</div>
              <h3>Recipe Collection</h3>
              <p>Browse from thousands of recipes</p>
            </Link>
            <Link to="/search?quick=true" className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Quick Meals</h3>
              <p>Filter by cooking time to find fast recipes</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Enter Ingredients</h3>
              <p>Tell us what ingredients you have in your pantry.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Search Recipes</h3>
              <p>Get instant recipe suggestions based on your ingredients.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Use Filters</h3>
              <p>Refine your search by cooking time and ingredient count.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Start Cooking</h3>
              <p>Cook delicious meals while reducing food waste!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <h2 className="section-title">Make a Difference</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">40%</div>
              <div className="stat-label">of food is wasted globally</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">$1,800</div>
              <div className="stat-label">average annual food waste per household</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1</div>
              <div className="stat-label">app to change that</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Make a Change?</h2>
          <p>Start exploring recipes and reducing food waste today.</p>
          <Link to="/search" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
