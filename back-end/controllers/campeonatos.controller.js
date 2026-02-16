const campeonatoService = require('../services/campeonatos.service');

async function criarCampeonatoController(req, res) {
  try {
    const { nome, tipo, dataInicio, dataFim, status, modalidadeId, quadraId, times, datasJogos, foto } = req.body;

    const usuarioId = req.body.usuarioId;

    const novoCampeonato = await campeonatoService.criarCampeonato({
      nome, tipo, dataInicio, dataFim, status, modalidadeId, quadraId, times, datasJogos, usuarioId, foto
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

async function listarPlacarPorFaseController(req, res) {
  const { campeonatoId } = req.params;

  try {
    const placaresPorFase = await campeonatoService.listarPlacarPorFase(campeonatoId);
    res.status(200).json(placaresPorFase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: error.message || "Erro ao listar placares por fase" });
  }
}

async function listarFasesERodadasController(req, res) {
  try {
    const { campeonatoId } = req.params;

    const fases = await campeonatoService.listarFasesERodadas(campeonatoId);

    return res.status(200).json(fases);
  } catch (error) {
    console.error("Erro ao listar fases e rodadas:", error);
    return res.status(400).json({
      erro: "Erro ao listar fases e rodadas",
      detalhes: error.message
    });
  }
}

async function adicionarFaseController(req, res) {
  try {
    const { campeonatoId } = req.params;
    const { nome, times } = req.body;

    if (!nome) {
      return res.status(400).json({
        error: 'O nome da fase é obrigatório',
      });
    }

    if (!Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        error: 'Informe os times que participarão da fase',
      });
    }

    const fase = await campeonatoService.criarFase(
      Number(campeonatoId),
      nome,
      times
    );

    return res.status(201).json(fase);
  } catch (error) {
    console.error('Erro ao criar fase:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

async function adicionarRodadaController(req, res) {
  try {
    const { faseId } = req.params;
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome da rodada é obrigatório" });
    }

    const rodada = await campeonatoService.criarRodada(parseInt(faseId), nome);

    return res.status(201).json({
      message: "Rodada criada com sucesso",
      rodada,
    });
  } catch (err) {
    console.error("Erro ao criar rodada:", err.message);
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { criarCampeonatoController, removerCampeonatoController, listarCampeonatosPorModalidadeController, listarCampeonatosAnoAtualController, artilhariaCampeonatoController, listarCampeonatoPorIdController, listarPlacarPorFaseController, listarFasesERodadasController, adicionarFaseController, adicionarRodadaController };