const partidas = require('../services/partida.service');
const { emitirAtualizacaoCampeonato } = require('../socket');

async function criarPartidaController(req, res) {
  try {
    const { modalidadeId, timeAId, timeBId, quadraId, campeonatoId, faseId, rodadaId } = req.body;
    const usuarioId = req.user.id; 
    
    const partida = await partidas.criarPartida(
      { modalidadeId, timeAId, timeBId, quadraId, campeonatoId, faseId, rodadaId },
      usuarioId
    );

    emitirAtualizacaoCampeonato({
      tipo: 'PARTIDA_CRIADA',
      partidaId: partida?.id,
      campeonatoId: partida?.campeonatoId,
      faseId: partida?.faseId,
      rodadaId: partida?.rodadaId
    });

    res.status(201).json(partida);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
}

async function iniciarPartidaController(req, res) {
  try {
    const { partidaId } = req.params;
    const { jogadores } = req.body;

    const partida = await partidas.iniciarPartida(partidaId, jogadores);

    res.status(200).json(partida);

  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: error.message });
  }
}

async function finalizarPartidaController(req, res) {
  try {
    const { id } = req.params
    const result = await partidas.finalizarPartida(id)

    emitirAtualizacaoCampeonato({
      tipo: 'PARTIDA_FINALIZADA',
      partidaId: Number(id),
      campeonatoId: result?.partida?.campeonatoId,
      faseId: result?.partida?.faseId,
      rodadaId: result?.partida?.rodadaId
    })

    return res.json(result)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

async function atualizarParcialController(req, res) {
  try {
    const { id } = req.params;
    const dadosParciais = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID da partida é obrigatório" });
    }

    const partidaAnterior = await partidas.retornarPartida(id);
    const partidaAtualizada = await partidas.atualizarParcial(id, dadosParciais);

    const pontosAntesA = Number(partidaAnterior?.pontosTimeA ?? 0);
    const pontosAntesB = Number(partidaAnterior?.pontosTimeB ?? 0);
    const pontosDepoisA = Number(partidaAtualizada?.pontosTimeA ?? pontosAntesA);
    const pontosDepoisB = Number(partidaAtualizada?.pontosTimeB ?? pontosAntesB);

    const houveMudancaNoPlacar =
      pontosAntesA !== pontosDepoisA ||
      pontosAntesB !== pontosDepoisB;

    if (houveMudancaNoPlacar) {
      emitirAtualizacaoCampeonato({
        tipo: 'GOL_PARTIDA',
        partidaId: Number(id),
        campeonatoId: partidaAtualizada?.campeonatoId ?? partidaAnterior?.campeonatoId,
        faseId: partidaAtualizada?.faseId ?? partidaAnterior?.faseId,
        rodadaId: partidaAtualizada?.rodadaId ?? partidaAnterior?.rodadaId,
        pontosTimeA: pontosDepoisA,
        pontosTimeB: pontosDepoisB
      });
    }

    return res.json(partidaAtualizada);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || "Erro ao atualizar a partida" });
  }
}

async function incrementarPlacarController(req, res) {
  const { id } = req.params;
  const incremento = req.body;
  const usuarioId = req.user?.id;

  if (!id) return res.status(400).json({ error: 'ID do placar é obrigatório' });

  if (!usuarioId) {
    return res.status(400).json({ error: "Usuário não informado." });
  }

  try {
    const placarAtualizado = await partidas.incrementarPlacar(id, incremento, usuarioId);
    res.json(placarAtualizado);
  } catch (err) {
    console.error('Erro ao incrementar placar:', err);
    res.status(500).json({ error: 'Não foi possível atualizar o placar' });
  }
}

async function retornarPartidaController(req, res) {
  try {
    const { id } = req.params;
    const partida = await partidas.retornarPartida(id);
    return res.json(partida);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

async function adicionarJogadorPartidaController(req, res) {
  const { partidaId, jogadorId } = req.params;
  const { timeId, ...stats } = req.body;

  try {
    if (!timeId) {
      return res.status(400).json({ message: "timeId é obrigatório" });
    }

    const vinculo = await partidas.vincularJogadorPartida(
      Number(partidaId),
      Number(jogadorId),
      Number(timeId),
      stats
    );

    res.status(201).json(vinculo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listarJogadoresSelecionadosController(req, res) {
  try {
    const { partidaId } = req.params;

    if (!partidaId) {
      return res.status(400).json({ error: "O ID da partida é obrigatório." });
    }

    const jogadores = await partidas.listarJogadoresSelecionados(partidaId);
    return res.json(jogadores);

  } catch (error) {
    console.error("Erro ao listar jogadores selecionados:", error);
    return res.status(500).json({ error: "Erro ao listar jogadores selecionados." });
  }
}

async function atualizarAtuacaoJogadorController(req, res) {
  try {
    const { jogadorId, partidaId, gols, cartoesAmarelos, cartoesVermelhos } = req.body;

    if (!jogadorId || !partidaId) {
      return res.status(400).json({ message: "jogadorId e partidaId são obrigatórios" });
    }

    const atuacao = await partidas.atualizarAtuacaoJogadorPartida({
      jogadorId,
      partidaId,
      gols: gols,
      cartoesAmarelos: cartoesAmarelos,
      cartoesVermelhos: cartoesVermelhos
    });

    return res.status(200).json(atuacao);
  } catch (error) {
    console.error("Erro ao atualizar atuação do jogador:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function substituirJogadorController(req, res) {
  try {
    const { partidaId } = req.params;
    const { jogadorSaiId, jogadorEntraId } = req.body;

    if (!jogadorSaiId || !jogadorEntraId) {
      return res.status(400).json({ error: "IDs de jogadores são obrigatórios" });
    }

    const jogadorSubstituido = await partidas.substituirJogadorPartida(
      Number(partidaId),
      Number(jogadorSaiId),
      Number(jogadorEntraId)
    );

    return res
      .status(200)
      .json({ message: "Substituição realizada com sucesso", jogadorSubstituido });

  } catch (error) {
    console.error('Erro na substituição:', error.message);
    return res.status(400).json({ error: error.message });
  }
}

async function getJogadoresForaDaPartidaController(req, res) {
  try {
    const { partidaId, timeId } = req.params

    const jogadores = await partidas.getJogadoresForaDaPartida(
      Number(partidaId),
      Number(timeId)
    )

    return res.json(jogadores)
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: 'Erro ao buscar jogadores fora da partida'
    })
  }
}

async function removerJogadorDeCampoController(req, res) {
  try {
    const { partidaId, jogadorId } = req.params;

    const resultado = await partidas.removerJogadorDeCampo(
      Number(partidaId),
      Number(jogadorId)
    );

    return res.status(200).json({
      message: "Jogador removido de campo com sucesso",
      jogador: resultado
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}

async function detalharPartidaController(req, res) {
  try {
    const { id } = req.params

    const partida = await partidas.detalharPartida(id)

    return res.status(200).json(partida)
  } catch (error) {
    return res.status(404).json({
      erro: error.message || 'Erro ao detalhar partida'
    })
  }
}

async function listarPartidasDaRodadaDaFaseController(req, res) {
  const { campeonatoId, faseId, rodadaId } = req.params
  const cId = Number(campeonatoId)
  const fId = Number(faseId)
  const rId = Number(rodadaId)

  if (!cId || !fId || !rId) {
    return res.status(400).json({ message: "IDs inválidos. Envie apenas números." })
  }

  try {
    const partida = await partidas.listarPartidasDaRodadaDaFase(cId, fId, rId)
    return res.json(partida)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}

function listarStatusPartidaController(req, res) {
  try {
    const { statusAtual } = req.query;

    const status = partidas.listarStatusPartida(statusAtual);

    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function alterarStatusPartidaController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'O novo status é obrigatório'
      });
    }

    const partida = await partidas.alterarStatusPartida(id, status);

    emitirAtualizacaoCampeonato({
      tipo: status === 'FINALIZADA' ? 'PARTIDA_FINALIZADA' : 'STATUS_PARTIDA_ATUALIZADO',
      partidaId: Number(id),
      campeonatoId: partida?.campeonatoId,
      faseId: partida?.faseId,
      rodadaId: partida?.rodadaId
    });

    return res.json({
      message: 'Status da partida atualizado com sucesso',
      partida
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}

module.exports = {
  criarPartidaController,
  iniciarPartidaController,
  finalizarPartidaController,
  atualizarParcialController,
  incrementarPlacarController,
  retornarPartidaController,
  adicionarJogadorPartidaController,
  listarJogadoresSelecionadosController,
  atualizarAtuacaoJogadorController,
  substituirJogadorController,
  getJogadoresForaDaPartidaController,
  removerJogadorDeCampoController,
  detalharPartidaController,
listarPartidasDaRodadaDaFaseController,
  listarStatusPartidaController,
  alterarStatusPartidaController
};
