const partidas = require('../services/partida.service');

async function criarPartidaController(req, res) {
  try {
    const { usuarioId, modalidadeId, timeAId, timeBId, quadraId } = req.body;

    const partida = await partidas.criarPartida(
      { modalidadeId, timeAId, timeBId, quadraId },
      usuarioId
    );

    res.status(201).json(partida);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
}

async function finalizarPartidaController(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;

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

async function listarPartidasController(req, res) {
  try {
    const partidalistadas = await partidas.listarPartidas();
    res.json(partidalistadas);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ error: 'Erro ao listar partidas' });
  }
}

async function listarPartidasAtivasController(req, res) {
  try {
    const ativas = await partidas.listarPartidasAtivas();
    res.json(ativas);
  } catch (error) {
    console.error("Erro ao listar partidas ativas:", error);
    res.status(500).json({ error: "Erro ao listar partidas ativas" });
  }
}

async function listarPartidasEncerradasController(req, res) {
  try {
    const encerradas = await partidas.listarPartidasEncerradas();
    res.json(encerradas);
  } catch (error) {
    console.error("Erro ao listar partidas encerradas:", error);
    res.status(500).json({ error: "Erro ao listar partidas encerradas" });
  }
}

async function pausarPartidaController(req, res) {
  try {
    const { id } = req.params;

    const partida = await partidas.pausarPartida(id);
    res.json({ message: "Partida pausada com sucesso!", partida });
  } catch (error) {
    console.error("Erro ao pausar partida:", error);
    res.status(500).json({ error: "Erro ao pausar partida" });
  }
}

async function retomarPartidaController(req, res) {
  try {
    const { id } = req.params;

    const partida = await partidas.retomarPartida(id);
    res.json({ message: "Partida retomada com sucesso!", partida });
  } catch (error) {
    console.error("Erro ao retomar partida:", error);
    res.status(500).json({ error: "Erro ao retomar partida" });
  }
}

async function listarPartidaAtivasUsuarioController(req, res) {
  try {
    const usuarioId = req.query.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ error: "Usuário não informado." });
    }

    const partidaAtiva = await partidas.listarPartidaAtivaUsuario(usuarioId);

    res.json(partidaAtiva);
  } catch (err) {
    console.error("Erro ao buscar partida aberta:", err);
    res.status(500).json({ error: "Erro ao buscar partida aberta" });
  }
}

async function limparPartidasPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    const resultado = await partidas.limparPartidasPorModalidade(modalidadeId);
    return res.json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
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
  const stats = req.body;

  try {
    const vinculo = await partidas.vincularJogadorPartida(
      Number(partidaId),
      Number(jogadorId),
      stats
    );

    res.status(201).json(vinculo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function carregarUltimaPartida(req, res) {
  try {
    const usuarioId = req.user.id; // PEGAR DO TOKEN

    if (!usuarioId) {
      return res.status(401).json({
        error: "Usuário não autenticado. Token inválido ou ausente."
      });
    }

    const partida = await partidas.UltimaPartidaAbertaDoUsuario(usuarioId);

    if (!partida) {
      return res.status(404).json({
        message: "Nenhuma partida aberta encontrada para este usuário.",
      });
    }

    res.json(partida);
  } catch (error) {
    console.error("Erro ao carregar partida:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

module.exports = {
  criarPartidaController,
  finalizarPartidaController,
  atualizarParcialController,
  incrementarPlacarController,
  listarPartidasController,
  listarPartidasAtivasController,
  listarPartidasEncerradasController,
  pausarPartidaController,
  retomarPartidaController,
  listarPartidaAtivasUsuarioController,
  limparPartidasPorModalidadeController,
  vincularUsuarioController,
  adicionarJogadorPartidaController,
  carregarUltimaPartida
};