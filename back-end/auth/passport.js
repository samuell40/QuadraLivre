const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { verificarUsuario } = require('../controllers/auth.controller');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true, 
}, verificarUsuario));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, { id });
});

module.exports = passport;
