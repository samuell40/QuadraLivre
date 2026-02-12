const partidas = require('../services/partida.service');

async function criarPartidaController(req, res) {
  try {
    const { usuarioId,  modalidadeId, timeAId, timeBId, quadraId, campeonatoId} = req.body;

    const partida = await partidas.criarPartida(
      { modalidadeId, timeAId, timeBId, quadraId, campeonatoId },
      usuarioId
    );

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
    const { id } = req.params;
    const { usuarioId } = req.body; 

    if (!usuarioId) {
      return res.status(400).json({ erro: "Usuário não informado." });
    }

    const partida = await partidas.finalizarPartida(id, { usuarioId });

    res.json(partida);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
}

async function excluirPartidaController(req, res) {
  try {
    const { partidaId } = req.params;

    if (!partidaId) {
      return res.status(400).json({ error: "ID da partida é obrigatório" });
    }

    const partida = await partidas.excluirPartida(partidaId);

    return res.status(200).json(partida);

  } catch (error) {
    console.error(error);

    if (error.message === "Partida não encontrada") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}

async function atualizarParcialController(req, res) {
  try {
    const { id } = req.params;
    const dadosParciais = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID da partida é obrigatório" });
    }

    const partidaAtualizada = await partidas.atualizarParcial(id, dadosParciais);
    return res.json(partidaAtualizada);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar a partida" });
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

async function listarPartidaAndamentoController(req, res) {
  try {
    const { modalidadeId, campeonatoId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ error: 'modalidadeId é obrigatório' });
    }

    const partidas_ativas = await partidas.listarPartidasemAndamento(
      modalidadeId,
      campeonatoId
    );

    res.json(partidas_ativas);
  } catch (error) {
    console.error('Erro ao listar partidas ativas:', error);
    res.status(500).json({ error: 'Erro ao listar partidas ativas' });
  }
}

async function listarPartidasEncerradasController(req, res) {
  try {
    const { modalidadeId, campeonatoId } = req.params

    if (!modalidadeId || !campeonatoId) {
      return res.status(400).json({
        error: 'modalidadeId e campeonatoId são obrigatórios'
      })
    }

    const partidas_encerradas = await partidas.listarPartidasEncerradas(
      modalidadeId,
      campeonatoId
    )

    res.json(partidas_encerradas)
  } catch (error) {
    console.error('Erro ao listar partidas encerradas:', error)
    res.status(500).json({
      error: 'Erro ao listar partidas encerradas'
    })
  }
}

async function retornarPartidaEmAndamentoController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID da partida é obrigatório'
      });
    }

    const partida = await partidas.retornarPartidaEmAndamento(id);

    return res.status(200).json(partida);
  } catch (error) {
    return res.status(404).json({
      message: error.message || 'Erro ao retornar partida'
    });
  }
}

async function vincularUsuarioController(req, res) {
  try {
    const { partidaId, usuarioId, permissaoId } = req.body;

    if (!partidaId || !usuarioId || !permissaoId) {
      return res.status(400).json({ message: "partidaId, usuarioId e permissaoId são obrigatórios" });
    }
    const vinculo = await partidas.vincularUsuarioAPartida(
      Number(partidaId),
      Number(usuarioId),
      Number(permissaoId)
    );
    return res.status(201).json(vinculo);
  } catch (error) {
    console.error("Erro ao vincular usuário:", error);
    return res.status(400).json({ message: error.message });
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

module.exports = {
  criarPartidaController,
  iniciarPartidaController,
  finalizarPartidaController,
  excluirPartidaController,
  atualizarParcialController,
  incrementarPlacarController,
  listarPartidaAndamentoController,
  listarPartidasEncerradasController,
  retornarPartidaEmAndamentoController,
  vincularUsuarioController,
  adicionarJogadorPartidaController,
  listarJogadoresSelecionadosController,
  atualizarAtuacaoJogadorController,
  substituirJogadorController,
  getJogadoresForaDaPartidaController,
  removerJogadorDeCampoController,
  detalharPartidaController
};