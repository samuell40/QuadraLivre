const campeonatoService = require('../services/campeonatos.service');

async function criarCampeonatoController(req, res) {
  try {
    const {
      nome,
      descricao,
      dataInicio,
      dataFim,
      status,
      modalidadeId,
      quadraId,
      times,
      datasJogos,
      foto
    } = req.body;

    const usuarioId = req.body.usuarioId;
    
    const novoCampeonato = await campeonatoService.criarCampeonato({
      nome,
      descricao,
      dataInicio,
      dataFim,
      status: status,
      modalidadeId,
      quadraId,
      times,          // 👈 AGORA CHEGA NO SERVICE
      datasJogos,
      usuarioId,
      foto
    });

    return res.status(201).json(novoCampeonato);

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

async function listarCampeonatosAnoAtualController(req, res) {
  try {
    const campeonatos = await campeonatoService.listarCampeonatosAnoAtual()

    return res.status(200).json(campeonatos)
  } catch (error) {
    console.error('Erro ao listar campeonatos do ano atual:', error)

    return res.status(500).json({
      message: 'Erro ao listar campeonatos do ano atual'
    })
  }
}

async function artilhariaCampeonatoController(req, res) {
  try {
    const { campeonatoId } = req.params;

    const artilharia = await campeonatoService.listarArtilhariaCampeonato(campeonatoId);

    return res.json(artilharia);
  } catch (error) {
    console.error('Erro ao buscar artilharia:', error);
    return res.status(500).json({
      erro: 'Erro ao buscar artilharia do campeonato'
    });
  }
}

async function listarCampeonatoPorIdController(req, res) {
  const { id } = req.params;

  try {
    const campeonato = await campeonatoService.getCampeonatoById(id);

    if (!campeonato) {
      return res.status(404).json({ message: 'Campeonato não encontrado' });
    }

    res.json(campeonato);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar campeonato' });
  }
}


module.exports = { criarCampeonatoController, removerCampeonatoController, listarCampeonatosPorModalidadeController, listarCampeonatosAnoAtualController, artilhariaCampeonatoController, listarCampeonatoPorIdController };