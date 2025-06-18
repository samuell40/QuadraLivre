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

async function getUsuarios(req, res){
  try {
    const usuario = await Usuario.getUsuarios();
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro no getUsuarios:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' }); 
  }
};

module.exports = { postUsuario, updateUsuario, getUsuarios };
