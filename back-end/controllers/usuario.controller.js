const Usuario = require('../services/usuario.service');

async function postUsuario(req, res) {
  try {
    const cadastro = await Usuario.postUsuario(req.body);
    res.status(200).json({ cadastro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

async function updateUsuario(req, res) {
  try {
    const editar = await Usuario.updateProfissional(req.body); 
    res.status(200).json({ editar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao editar usuário.' });
  }
}

module.exports = { postUsuario, updateUsuario };
