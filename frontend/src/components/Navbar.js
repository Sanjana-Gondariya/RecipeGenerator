import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-icon">🍽️</span>
          <span className="navbar-title">Food Waste Saver</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/search" className="navbar-link">Search</Link>
          {user && (
            <>
              <Link to="/ingredients" className="navbar-link">My Ingredients</Link>
              <Link to="/bookmarks" className="navbar-link">Bookmarks</Link>
              <Link to="/recommendations" className="navbar-link">Recommendations</Link>
            </>
          )}
          {user ? (
            <button onClick={handleLogout} className="navbar-link navbar-button">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/signup" className="navbar-link navbar-button">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
