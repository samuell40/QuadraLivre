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
      req.authInfo = info;
      return loginFalhou(req, res);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // 🔥 Gerar Token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          nome: user.nome,
          permissao: user.permissaoId, // 🔥 Importante para permissões
        },
        config.jwtSecret,
        { expiresIn: '8h' }
      );

      // 🔥 Retornar o token no front
      //res.redirect(`http://localhost:8080/token=${token}`);
      res.redirect(`http://localhost:8080/`);
    });
  })(req, res, next);
}

function loginFalhou(req, res) {
  const errorMessage = req.authInfo?.message;
  if (errorMessage === 'usuario_nao_cadastrado') {
    return res.redirect('http://localhost:8080/cadastro');
  }
}

module.exports = {
  verificarUsuario,
  iniciarLoginGoogle,
  callbackLoginGoogle,
  loginFalhou,
};
