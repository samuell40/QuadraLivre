const campeonatoService = require('../services/campeonatos.service');

async function criarCampeonatoController(req, res) {
  try {
    const novocampeonato = await campeonatoService.criarCampeonato(req.body);
    return res.status(201).json(novocampeonato);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(400).json({
      erro: "Erro ao criar campeonato",
      detalhes: error.message 
    });
  }
}

async function removerCampeonatoController(req, res, next) {
  try {
    const resultado = await campeonatoService.removerCampeonato(req.params.id);
    res.status(200).json({ mensagem: resultado.mensagem });
  } catch (err) {
    console.error(`Erro ao remover campeonato:`, err.message);
    next(err);
  }
}

async function listarCampeonatosPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;
    const { ano } = req.query; 
    if (!modalidadeId) {
      return res.status(400).json({ error: 'ID da modalidade é obrigatório.' });
    }
    const campeonatos = await campeonatoService.listarCampeonatosPorModalidade(Number(modalidadeId), ano);
    
    return res.status(200).json(campeonatos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar campeonatos.' });
  }
}

module.exports = { criarCampeonatoController, removerCampeonatoController, listarCampeonatosPorModalidadeController };