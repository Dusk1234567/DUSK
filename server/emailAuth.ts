import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import type { Express, Request, Response } from "express";
import { z } from "zod";



const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function setupEmailAuth(app: Express) {
  // Local Strategy for email/password
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }));

  // Register route
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await storage.upsertUser({
        email,
        firstName,
        lastName,
        passwordHash,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'lifesteal-jwt-secret',
        { expiresIn: '7d' }
      );

      // Set session
      (req.session as any).userId = user.id;

      res.json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'lifesteal-jwt-secret',
        { expiresIn: '7d' }
      );

      // Set session
      (req.session as any).userId = user.id;

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ 
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
}