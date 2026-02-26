const Usuario = require('../services/usuario.service');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

async function cadastrarUsuarioController(req, res) {
  try {
    const { nome, email, telefone, foto } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios.',
      });
    }

    const cadastro = await Usuario.cadastrarUsuario({
      nome,
      email,
      telefone,
      foto,
    });

    const tokenPayload = {
      id: cadastro.id,
      nome: cadastro.nome,
      email: cadastro.email,
      telefone: cadastro.telefone,
      foto: cadastro.foto,
      permissaoId: cadastro.permissaoId,
      permissao: cadastro.permissao || null,
      quadraId: cadastro.quadraId ?? null,
      quadra: cadastro.quadra || null
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.JWT_EXPIRATION
    });

    return res.status(201).json({
      usuario: tokenPayload,
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Erro ao cadastrar usuário.',
    });
  }
}

async function atualizarUsuarioController(req, res) {
  try {
    const { email, permissaoId, quadraId } = req.body;

    if (!email || !permissaoId) {
      return res.status(400).json({
        error: 'Email e permissão são obrigatórios.',
      });
    }

    const usuarioAtualizado = await Usuario.atualizarUsuario({
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

async function listarUsuariosController(req, res) {
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

async function listarPermissoesController(req, res) {
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
    const { usuarioId, timeId, jogadorId } = req.body;

    if (!usuarioId || !timeId || !jogadorId) {
      return res.status(400).json({
        error: 'Usuário, time e jogador são obrigatórios.',
      });
    }

    const resultado = await Usuario.vincularUsuarioTime(
      usuarioId,
      timeId,
      jogadorId
    );

    return res.status(201).json({
      message: 'Vínculo realizado com sucesso',
      vinculo: resultado.vinculo,
      jogador: resultado.jogador,
    });
  } catch (error) {
    console.error('Erro ao vincular usuário ao time:', error);
    return res.status(400).json({
      error: error.message || 'Erro ao vincular usuário ao time.',
    });
  }
}

async function listarUsuarioTimesController(req, res) {
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
  cadastrarUsuarioController,
  atualizarUsuarioController,
  listarUsuariosController,
  listarPermissoesController,
  vincularUsuarioTimeController,
  listarUsuarioTimesController
};
