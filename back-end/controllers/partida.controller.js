const partidas = require('../services/partida.service')

async function criarPartidaController(req, res) {
  try {
    const partida = await partidas.criarPartida(req.body)
    res.status(201).json(partida)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: error.message })
  }
}

async function finalizarPartidaController(req, res) {
  try {
    const partidaId = Number(req.params.id)
    const partidaFinalizada = await partidas.finalizarPartida(partidaId, req.body)
    res.json(partidaFinalizada)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: error.message })
  }
}

async function listarPartidasController(req, res) {
  try {
    const partidas = await partidas.listarPartidas()
    res.json(partidas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: error.message })
  }
}

async function incrementarPlacarController(req, res) {
  try {
    const { id } = req.params;
    const incremento = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do placar é obrigatório.' });
    }

    const placarAtualizado = await partidas.incrementarPlacar(id, incremento);
    return res.status(200).json({ mensagem: 'Placar incrementado com sucesso', placar: placarAtualizado });
  } catch (error) {
    console.error('Erro ao incrementar placar:', error);
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = { criarPartidaController, finalizarPartidaController, listarPartidasController, incrementarPlacarController}