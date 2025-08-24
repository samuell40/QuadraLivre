const Usuario = require('../services/usuario.service');

async function postUsuarioController(req, res) {
  try {
    const { nome, email, telefone, foto } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    const cadastro = await Usuario.postUsuario({ nome, email, telefone, foto });
    return res.status(201).json({ cadastro });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

async function updateUsuarioController(req, res) {
  try {
    const { email, funcao, permissaoId, quadra } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email do usuário é obrigatório.' });
    }

    const usuarioAtualizado = await Usuario.updateUsuario({ email, funcao, permissaoId, quadra });
    return res.status(200).json({ usuario: usuarioAtualizado });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
}

async function getUsuariosController(req, res) {
  try {
    const usuarios = await Usuario.getUsuarios();
    return res.status(200).json(usuarios);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
}

async function getPermissoesController(req, res) {
  try {
    const permissoes = await Usuario.listarPermissoes();
    return res.status(200).json(permissoes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar permissões.' });
  }
}

const vincularUsuarioTimeController = async (req, res) => {
  try {
    const { usuarioId, timeId } = req.body;
    const vinculo = await Usuario.vincularUsuarioTime(usuarioId, timeId);
    return res.status(201).json({ 
      message: 'Usuário vinculado ao time com sucesso', 
      vinculo 
    });
  } catch (error) {
    if (error.message.includes('já está vinculado ao time')) {
      return res.status(409).json({ error: error.message }); 
    }
    
    console.error('Erro ao vincular usuário ao time:', error);
    return res.status(400).json({ error: error.message || 'Erro ao vincular usuário ao time.' });
  }
};

module.exports = {
  postUsuarioController,
  updateUsuarioController,
  getUsuariosController,
  getPermissoesController,
  vincularUsuarioTimeController}