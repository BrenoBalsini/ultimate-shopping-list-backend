import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import pool from './database';

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const user = result.rows;
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

        if (result.rows.length > 0) {
          return done(null, result.rows);
        }

        // Create new user
        const newUserResult = await pool.query(
          `INSERT INTO users (email, google_id, name, avatar_url) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [profile.emails?..value, profile.id, profile.displayName, profile.photos?..value]
        );

        return done(null, newUserResult.rows);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows);
  } catch (error) {
    done(error);
  }
});

export default passport;
