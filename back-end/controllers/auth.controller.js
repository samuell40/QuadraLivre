const passport = require('passport');
const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../services/auth.service');
const config = require('../config/app.config');

async function verificarUsuario(req, accessToken, refreshToken, profile, done) {
  try {
    if (!profile?.emails) {
      return done(null, false, { message: 'Email não encontrado no perfil do Google.' });
    }

    const email = profile.emails[0].value;
    const user = await findUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'usuario_nao_cadastrado', email });
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
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Erro na autenticação:', err);
      return next(err);
    }

    if (!user) {
      const email = info?.email || '';

      return res.redirect(`http://localhost:8080/login?erro=usuario_nao_cadastrado&email=${encodeURIComponent(email)}`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Erro no login:', err);
        return next(err);
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          nome: user.nome,
          permissao: user.permissaoId,
        },
        config.jwtSecret,
        { expiresIn: '8h' }
      );

      res.redirect(`http://localhost:8080/agendarquadra/?token=${token}`);
    });
  })(req, res, next);
}

function loginFalhou(req, res) {
  const { email, erro } = req.query;

  if (erro === 'usuario_nao_cadastrado' && email) {
    return res.redirect(`http://localhost:8080/login?erro=usuario_nao_cadastrado&email=${encodeURIComponent(email)}`);
  }

  return res.redirect('http://localhost:8080/login?erro=usuario_nao_cadastrado');
}

module.exports = {
  verificarUsuario,
  iniciarLoginGoogle,
  callbackLoginGoogle,
  loginFalhou,
};