const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const { findUserByEmail } = require('../services/auth.service');

async function verificarUsuario(req, accessToken, refreshToken, profile, done) {
  try {
    const email = profile.emails?.[0]?.value;
    const { user } = await findUserByEmail(email);
    return done(null, { user });
  } catch (err) {
    const email = profile.emails?.[0]?.value || '';
    if (err.message === 'usuario_nao_cadastrado') {
      return done(null, false, { message: 'usuario_nao_cadastrado', email });
    }
    return done(err);
  }
}

function iniciarLoginGoogle(req, res, next) {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account', 
  })(req, res, next);
}

function callbackLoginGoogle(req, res, next) {
  passport.authenticate('google', { session: false }, (err, result, info) => {
    if (!result || !result.user) {
      const email = info?.email || '';
      const redirectUrl = `http://localhost:8080/google-callback?erro=usuario_nao_cadastrado&email=${encodeURIComponent(email)}`;
      return res.redirect(redirectUrl);
    }

    try {
      const { user } = result;

      const tokenPayload = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        permissao: user.permissao,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.JWT_EXPIRATION,
      });

      const payload = encodeURIComponent(
        JSON.stringify({ token, usuario: user })
      );

      const redirectUrl = `http://localhost:8080/google-callback?data=${payload}`; /*https://quadra-livre.vercel.app */
      return res.redirect(redirectUrl);

    } catch (error) {
      console.error('Erro no callbackLoginGoogle:', error);
      return res.status(500).json({ erro: 'erro_callback_google', detalhes: error.message });
    }
  })(req, res, next);
}

module.exports = {
  verificarUsuario,
  iniciarLoginGoogle,
  callbackLoginGoogle,
};
