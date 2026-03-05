const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { verificarUsuario } = require('../controllers/auth.controller');

// Estratégia do Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://quadra-livre-backend.onrender.com/auth/google/callback',
  passReqToCallback: true,
}, verificarUsuario));

module.exports = passport;
