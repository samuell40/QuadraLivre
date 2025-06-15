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
      // envia email junto para o redirect
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
  passport.authenticate('google', { failureRedirect: '/auth/login/failure' }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // aqui pega o email do profile da requisição (se possível)
      const email = req.user?.email || (req.authInfo && req.authInfo.email) || null;

      // Como provavelmente não tem, tente pegar do req ou info
      // Se não conseguir pegar, altere a função verificarUsuario para passar email no info

      // Redireciona para cadastro passando o email na query string
      if (info && info.message === 'usuario_nao_cadastrado' && info.email) {
        return res.redirect(`http://localhost:8080/cadastro?email=${encodeURIComponent(info.email)}`);
      }

      // Caso não tenha o email, redirecione só pra cadastro sem email
      return res.redirect('http://localhost:8080/cadastro');
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

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
