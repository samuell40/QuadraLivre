const passport = require('passport');
const { findUserByEmail } = require('../services/auth.service');

async function verificarUsuario(req, accessToken, refreshToken, profile, done) {
  try {
    if (!profile?.emails) {
      return done(null, false, { message: 'Email não encontrado no perfil do Google.' });
    }

    const email = profile.emails[0].value;
    const user = await findUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'usuario_nao_cadastrado' });
    }

    return done(null, user);
  } catch (err) {
    console.error('Erro na verificação do usuário:', err);
    return done(err);
  }
}

function iniciarLoginGoogle(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

function callbackLoginGoogle(req, res, next) {
  passport.authenticate('google', { failureRedirect: '/auth/login/failure' }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.authInfo = info; // repassa info para loginFalhou
      return loginFalhou(req, res);
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return loginRedirect(req, res);
    });
  })(req, res, next);
}

function loginRedirect(req, res) { // Login bem-sucedido
  res.redirect('http://localhost:8080/');
}

function loginFalhou(req, res) {
  const errorMessage = req.authInfo?.message;

  if (errorMessage === 'usuario_nao_cadastrado') {
    return res.redirect('http://localhost:8080/login?erro=usuario_nao_cadastrado');
  }

  res.redirect('http://localhost:8080/login');
}

module.exports = {
  verificarUsuario,
  iniciarLoginGoogle,
  callbackLoginGoogle,
  loginRedirect,
  loginFalhou,
};
