const avisoService = require('../services/aviso.service');

async function criarAvisoController(req, res) {
  try {
    const novoAviso = await avisoService.criarAviso(req.body);
    return res.status(201).json(novoAviso);
  } catch (error) {
    console.error("Erro ao criar aviso:", error);
    return res.status(500).json({ error: 'Erro ao criar aviso.' });
  }
}

async function listarAvisosController(req, res) {
  try {
    const { quadraId } = req.params;
    const lista = await avisoService.listarAvisosPorQuadra(quadraId);
    return res.status(200).json(lista);
  } catch (error) {
    console.error("Erro ao buscar avisos:", error);
    return res.status(500).json({ error: 'Erro ao buscar avisos.' });
  }
}

async function deletarAvisoController(req, res) {
  try {
    const { id } = req.params;
    await avisoService.deletarAviso(id);
    return res.status(200).json({ message: 'Aviso deletado com sucesso.' });
  } catch (error) {
    console.error("Erro ao deletar aviso:", error);
    return res.status(500).json({ error: 'Erro ao deletar aviso.' });
  }
}

async function fixarAvisoController(req, res) {
  try {
    const { id } = req.params;
    const { fixado } = req.body;
    const avisoAtualizado = await avisoService.alternarFixado(id, fixado);
    return res.status(200).json(avisoAtualizado);
  } catch (error) {
    console.error("Erro ao fixar aviso:", error);
    return res.status(500).json({ error: 'Erro ao alterar status fixado.' });
  }
}

async function lerAvisoController(req, res) {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;
    
    await avisoService.marcarComoLido(id, usuarioId);
    return res.status(200).json({ message: 'Aviso marcado como lido.' });
  } catch (error) {
    console.error("Erro ao ler aviso:", error);
    return res.status(500).json({ error: 'Erro ao marcar leitura.' });
  }
}

module.exports = {
  criarAvisoController,
  listarAvisosController,
  deletarAvisoController,
  fixarAvisoController,
  lerAvisoController
};