const Usuario = require('../services/usuario.service');

async function postUsuarioController(req, res) {
  try {
    const { nome, email, telefone, foto } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios.',
      });
    }

    const cadastro = await Usuario.postUsuario({
      nome,
      email,
      telefone,
      foto,
    });

    return res.status(201).json(cadastro);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Erro ao cadastrar usuário.',
    });
  }
}

async function updateUsuarioController(req, res) {
  try {
    const { email, permissaoId, quadraId } = req.body;

    if (!email || !permissaoId) {
      return res.status(400).json({
        error: 'Email e permissão são obrigatórios.',
      });
    }

    const usuarioAtualizado = await Usuario.updateUsuario({
      email,
      permissaoId,
      quadraId,
    });

    return res.status(200).json(usuarioAtualizado);
  } catch (err) {
    console.error(err);

    return res.status(400).json({
      error: err.message || 'Erro ao atualizar usuário.',
    });
  }
}

async function getUsuariosController(req, res) {
  try {
    const usuarios = await Usuario.getUsuarios();
    return res.status(200).json(usuarios);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Erro ao buscar usuários.',
    });
  }
}

async function getPermissoesController(req, res) {
  try {
    const permissoes = await Usuario.listarPermissoes();
    return res.status(200).json(permissoes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Erro ao buscar permissões.',
    });
  }
}

async function vincularUsuarioTimeController(req, res) {
  try {
    const { usuarioId, timeId } = req.body;

    if (!usuarioId || !timeId) {
      return res.status(400).json({
        error: 'Usuário e time são obrigatórios.',
      });
    }

    const vinculo = await Usuario.vincularUsuarioTime(usuarioId, timeId);

    return res.status(201).json({
      message: 'Usuário vinculado ao time com sucesso',
      vinculo,
    });
  } catch (error) {
    if (error.message.includes('já está vinculado')) {
      return res.status(409).json({ error: error.message });
    }

    console.error('Erro ao vincular usuário ao time:', error);
    return res.status(400).json({
      error: error.message || 'Erro ao vincular usuário ao time.',
    });
  }
}

async function getUsuarioTimesController(req, res) {
  try {
    const { id } = req.params;

    const usuario = await Usuario.getUsuarioTimesService(id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    const times = usuario.times.map(tu => tu.time);
    return res.status(200).json(times);
  } catch (err) {
    console.error('Erro ao buscar times do usuário:', err);
    return res.status(500).json({
      error: 'Erro interno ao buscar times do usuário',
    });
  }
}

module.exports = {
  postUsuarioController,
  updateUsuarioController,
  getUsuariosController,
  getPermissoesController,
  getUsuarioTimesController,
  vincularUsuarioTimeController,
};
