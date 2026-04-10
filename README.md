# Recipe Generator

A full-stack food waste reduction app that helps users turn the ingredients they already have into practical recipe ideas.

The project combines a React frontend with an Express backend to support recipe discovery, saved ingredients, bookmarks, onboarding preferences, and personalized recommendations. The goal is simple: make it easier to cook with what you already have instead of letting food go to waste.

## What The App Does

Users can:

- create an account and log in
- save ingredients they currently have at home
- search a large recipe dataset
- open detailed recipe pages
- bookmark recipes they want to come back to
- get recommendations based on bookmarks and saved preferences

## Features

- User authentication with signup and login
- Ingredient management for each user
- Recipe search and browsing
- Recipe detail pages
- Bookmark support
- Recommendation flow based on saved activity
- Onboarding/preferences support
- Local-first data storage using CSV and Excel files

## Tech Stack

### Frontend

- React
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express
- JWT authentication
- bcryptjs
- ExcelJS
- csv-parser

## Project Structure

```text
RecipeGenerator/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── data/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
├── package.json
└── README.md
```

## Main Pages

Frontend pages currently include:

- Home
- Recipe Search
- Recipe Detail
- Bookmarks
- Recommendations
- Ingredients
- Login
- Signup
- Onboarding

## Backend API Areas

The backend exposes route groups for:

- `/api/auth`
- `/api/recipes`
- `/api/bookmarks`
- `/api/recommendations`
- `/api/ingredients`

There is also a health check at:

- `/api/health`

## How Data Is Stored

This project does not rely on MongoDB or a hosted database.

Instead, it uses local files inside `backend/data/`, including:

- `recipes.csv` for the recipe dataset
- `users.xlsx` for user accounts
- `bookmarks.xlsx` for saved recipes
- `user_ingredients.xlsx` for pantry items
- `user_preferences.xlsx` for onboarding/preferences

That makes the project lightweight and easy to run locally for demos or class/project submissions.

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Sanjana-Gondariya/RecipeGenerator.git
cd RecipeGenerator
```

### 2. Install dependencies

```bash
npm run install:all
```

This installs:

- root dependencies
- backend dependencies
- frontend dependencies

### 3. Optional backend environment variables

Create a file at:

```text
backend/.env
```

You can add:

```env
PORT=5001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Important:

- login and signup now work locally even if `JWT_SECRET` is not set, because the backend includes a development fallback secret
- if you deploy the app, you should set a real `JWT_SECRET`

### 4. Start the app

Run both frontend and backend together:

```bash
npm run dev
```

### 5. Open the app

Frontend:

```text
http://localhost:3000
```

Backend API:

```text
http://localhost:5001/api
```

## Available Scripts

From the project root:

```bash
npm run dev
```

Runs frontend and backend together.

```bash
npm run dev:backend
```

Runs only the backend server.

```bash
npm run dev:frontend
```

Runs only the React frontend.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run install:all
```

Installs dependencies in all project folders.

## Authentication Notes

- passwords are hashed with `bcryptjs`
- authenticated routes use JWT tokens
- tokens are stored in `localStorage` on the frontend
- the frontend automatically sends the token on API requests through the shared Axios client

## Notes For Reviewers

- the frontend expects the backend API on port `5001` by default
- the frontend API base URL is configurable through `REACT_APP_API_URL`
- the recipe dataset is loaded by the backend when the server starts
- this project is intended to be easy to run locally without extra infrastructure

## Future Improvements

- deploy frontend and backend for a public live demo
- add filtering by dietary restrictions and cooking time in more places
- improve recommendation ranking
- add tests for auth and recipe search flows
- add better seed/demo data for user onboarding

## Team

- Riddhi Patel
- Sanjana Gondariya

