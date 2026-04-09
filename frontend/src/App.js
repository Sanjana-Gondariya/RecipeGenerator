import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecipeSearch from './pages/RecipeSearch';
import RecipeDetail from './pages/RecipeDetail';
import Bookmarks from './pages/Bookmarks';
import Recommendations from './pages/Recommendations';
import Ingredients from './pages/Ingredients';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

// Context
import { AuthProvider } from './context/AuthContext';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<RecipeSearch />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/ingredients" element={<Ingredients />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
