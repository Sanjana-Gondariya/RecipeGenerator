import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import excelStorage from '../models/excelStorage.js';

class AuthController {
  async signup(req, res) {
    try {
      const { email, password, username } = req.body;

      // Validation
      if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email, password, and username are required' });
      }

      // Check if user already exists
      const existingUser = await excelStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists',
          message: 'An account with this email address already exists. Please login instead.'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await excelStorage.createUser({
        email,
        password_hash: passwordHash,
        username
      });

      if (!result || !result.success) {
        return res.status(409).json({ 
          error: result?.error || 'Failed to create user',
          message: 'Unable to create user account. Please try again.'
        });
      }

      const user = {
        id: result.userId,
        email,
        username
      };

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to create user account',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await excelStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to login',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updatePreferences(req, res) {
    try {
      const userId = req.user.userId;
      const { dietary_restrictions, allergies, cooking_time_preference, cuisine_preferences, goals } = req.body;

      const result = await excelStorage.saveUserPreferences(userId, {
        dietary_restrictions,
        allergies,
        cooking_time_preference,
        cuisine_preferences,
        goals
      });

      if (!result.success) {
        return res.status(500).json({ error: 'Failed to update preferences' });
      }

      res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }

  async getPreferences(req, res) {
    try {
      const userId = req.user.userId;

      const preferences = await excelStorage.getUserPreferences(userId);

      if (!preferences) {
        return res.json({ preferences: null });
      }

      res.json({ preferences });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get preferences' });
    }
  }
}

export default new AuthController();

