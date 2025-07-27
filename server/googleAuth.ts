import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import type { Express } from "express";

export function setupGoogleAuth(app: Express) {
  // Check if Google OAuth credentials are available
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Google OAuth credentials not found. Google authentication will be disabled.");
    
    // Add disabled routes that return appropriate responses
    app.get('/api/auth/google', (req, res) => {
      res.status(501).json({ message: "Google authentication is not configured" });
    });
    
    app.get('/api/auth/google/callback', (req, res) => {
      res.status(501).json({ message: "Google authentication is not configured" });
    });
    
    return;
  }

  console.log("Setting up Google OAuth with credentials...");

  // Get the current domain for OAuth callback
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0];
  const callbackURL = domain ? `https://${domain}/api/auth/google/callback` : "/api/auth/google/callback";
  
  console.log(`Google OAuth Callback URL: ${callbackURL}`);
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`Google OAuth: Processing user ${profile.id} with email ${profile.emails?.[0]?.value}`);
      
      // Check if user already exists with this Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        console.log(`Google OAuth: Found existing user by Google ID`);
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          console.log(`Google OAuth: Linking Google account to existing user`);
          // Link Google account to existing user
          await storage.updateUserGoogleId(user.id!, profile.id);
          return done(null, user);
        }
      }

      // Create new user
      console.log(`Google OAuth: Creating new user`);
      const newUser = await storage.upsertUser({
        email: email || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value || '',
        googleId: profile.id,
      });

      done(null, newUser);
    } catch (error) {
      console.error('Google OAuth error:', error);
      done(error, false);
    }
  }));

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: any, res) => {
      console.log(`Google OAuth: Callback received for user`, req.user);
      
      // Set session after successful Google authentication
      if (req.user && req.user.id) {
        req.session.userId = req.user.id;
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
          } else {
            console.log(`Google OAuth: Session saved for user ${req.user.id}`);
          }
        });
      }
      // Successful authentication, redirect home
      res.redirect('/');
    }
  );
}