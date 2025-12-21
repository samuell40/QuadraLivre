const { criarCampeonato, listarCampeonatosPorModalidade } = require('../services/campeonatos.service');

async function criarCampeonatoController(req, res) {
  try {
    const novocampeonato = await criarCampeonato(req.body); 
    return res.status(201).json(novocampeonato);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      erro: "Erro ao criar campeonato",
    });
  }
}

async function listarCampeonatosPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;
    if (!modalidadeId) {
      return res.status(400).json({ error: 'ID da modalidade é obrigatório.' });
    }

    const campeonatos = await listarCampeonatosPorModalidade(Number(modalidadeId));
    return res.status(200).json(campeonatos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar campeonatos.' });
  }
}

module.exports = { criarCampeonatoController, listarCampeonatosPorModalidadeController };