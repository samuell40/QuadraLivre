const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const { findUserByEmail } = require('../services/auth.service');

async function verificarUsuario(req, accessToken, refreshToken, profile, done) {
  try {
    const email = profile?.emails?.[0]?.value; 

    if (!email) {
      return done(null, false, { message: 'Email não fornecido pelo Google' });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'usuario_nao_cadastrado', email });
    }

    return done(null, user); 
  } catch (err) {
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
  if (req.query.error === 'access_denied') {
    return res.send(`<script> window.close(); </script>`);
  }

  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err) throw err;

      if (!user) {
        const email = info?.email || '';
        const redirectUrl = `https://quadra-livre.vercel.app/google-callback?erro=usuario_nao_cadastrado&email=${encodeURIComponent(email)}`;
        return res.redirect(redirectUrl);
      }

      if (!user.id || !user.nome || !user.email) {
        return res.status(500).json({ erro: 'Dados do usuário incompletos' });
      }

      const tokenPayload = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || null,
        funcao: user.funcao || null,
        permissaoId: user.permissaoId || null,
        foto: user.foto || null,
        quadraId: user.quadraId || null
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: config.JWT_EXPIRATION });
      const payload = encodeURIComponent(JSON.stringify({ token, usuario: tokenPayload }));
      const redirectUrl = `https://quadra-livre.vercel.app/google-callback?data=${payload}`;
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