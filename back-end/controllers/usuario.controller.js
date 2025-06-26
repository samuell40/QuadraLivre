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
    const editar = await Usuario.updateUsuario(req.body); 
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

async function getPermissoes(req, res) {
  try {
    const permissoes = await Usuario.listarPermissoes();
    res.status(200).json(permissoes);
  } catch (err) {
    console.error('Erro ao buscar permissões:', err);
    res.status(500).json({ error: 'Erro ao buscar permissões.' });
  }
}

module.exports = { postUsuario, updateUsuario, getUsuarios, getPermissoes };
