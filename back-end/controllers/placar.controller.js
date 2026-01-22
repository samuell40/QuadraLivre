const placarService = require('../services/placar.service');

async function criarPlacarController(req, res) {
  try {
    const { campeonatoId, timeId } = req.body;

    if (!campeonatoId || !timeId) {
      return res.status(400).json({
        erro: 'campeonatoId e timeId são obrigatórios.'
      });
    }

    const placar = await placarService.criarPlacar({
      campeonatoId,
      timeId
    });

    return res.status(201).json({
      mensagem: 'Placar criado com sucesso.',
      placar
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function atualizarPlacarController(req, res) {
  try {
    const { id } = req.params;
    const campos = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do placar é obrigatório.' });
    }

    const placar = await placarService.atualizarPlacar(id, campos);

    return res.status(200).json({
      mensagem: 'Placar atualizado com sucesso.',
      placar
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarPlacarPorCampeonatoController(req, res) {
  try {
    const { campeonatoId } = req.params;

    if (!campeonatoId) {
      return res.status(400).json({
        erro: 'campeonatoId é obrigatório.'
      });
    }

    const placares = await placarService.listarPlacarPorCampeonato(Number(campeonatoId));

    return res.status(200).json({ placares });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = { criarPlacarController, atualizarPlacarController, listarPlacarPorCampeonatoController };