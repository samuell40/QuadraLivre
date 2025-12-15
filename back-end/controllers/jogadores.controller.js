const jogadorService = require('../services/jogador.service');

async function adicionarJogadorController(req, res) {
  try {
    const { timeId, nome, foto, funcaoId } = req.body;

    if (!timeId) {
      return res.status(400).json({ message: "timeId é obrigatório" });
    }

    const novoJogador = await jogadorService.adicionarJogador({
      timeId: Number(timeId),
      nome,
      foto,
      funcaoId: Number(funcaoId),
    });

    return res.status(201).json(novoJogador);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function removerJogadorController(req, res) {
  try {
    const { jogadorId } = req.params;

    if (!jogadorId) {
      return res.status(400).json({ message: "jogadorId é obrigatório" });
    }

    const resultado = await jogadorService.removerJogadorTime(Number(jogadorId));

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function listarJogadoresController(req, res) {
  try {
    const { timeId } = req.params;

    if (!timeId) {
      return res.status(400).json({ message: "timeId é obrigatório" });
    }

    const jogadores = await jogadorService.listarJogadoresPorTime(Number(timeId));

    return res.status(200).json(jogadores);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function adicionarFuncaoJogadorController(req, res) {
  try {
    const { nome, modalidadeId } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome da função é obrigatório" });
    }

    if (!modalidadeId) {
      return res.status(400).json({ message: "modalidadeId é obrigatório" });
    }

    const novaFuncao = await jogadorService.adicionarFuncaoJogador({
      nome,
      modalidadeId: Number(modalidadeId),
    });

    return res.status(201).json(novaFuncao);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(400).json({ message: error.message });
  }
}

async function removerFuncaoJogadorController(req, res) {
  try {
    const { id, modalidadeId } = req.body;

    if (!id) {
      return res.status(400).json({ message: "id é obrigatório" });
    }

    if (!modalidadeId) {
      return res.status(400).json({ message: "modalidadeId é obrigatório" });
    }

    const resultado = await jogadorService.removerFuncaoJogador({
      id: Number(id),
      modalidadeId: Number(modalidadeId),
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(400).json({ message: error.message });
  }
}

async function listarFuncoesJogadorController(req, res) {
  try {
    const { modalidadeId } = req.query;

    if (!modalidadeId) {
      return res.status(400).json({ 
        message: "É necessário informar o modalidadeId" 
      });
    }

    const funcoes = await jogadorService.listarFuncoesJogador(modalidadeId);
    return res.status(200).json(funcoes);
  } catch (error) {
    console.error("Erro ao listar funções:", error);
    return res.status(500).json({ message: "Erro ao listar funções." });
  }
}

async function atualizarFuncaoJogadorController(req, res) {
  try {
    const { jogadorId } = req.params;
    const { funcaoId } = req.body;

    if (!jogadorId) return res.status(400).json({ message: "jogadorId é obrigatório" });

    const jogadorAtualizado = await jogadorService.atualizarFuncaoJogador(Number(jogadorId), funcaoId ? Number(funcaoId) : null);

    return res.status(200).json(jogadorAtualizado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function atualizarAtuacaoController(req, res) {
  try {
    const { jogadorId, partidaId, gols, cartoesAmarelos, cartoesVermelhos } = req.body;

    if (!jogadorId || !partidaId) {
      return res.status(400).json({ message: "jogadorId e partidaId são obrigatórios" });
    }

    const atuacao = await jogadorService.atualizarAtuacaoJogador({
      jogadorId,
      partidaId,
      gols: gols || 0,
      cartoesAmarelos: cartoesAmarelos || 0,
      cartoesVermelhos: cartoesVermelhos || 0
    });

    return res.status(200).json(atuacao);
  } catch (error) {
    console.error("Erro ao atualizar atuação do jogador:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function listarJogadoresPartidaController(req, res) {
  const { partidaId, timeId } = req.params;

  try {
    const jogadores = await jogadorService.listarJogadoresPartida(timeId, partidaId);
    res.json(jogadores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar jogadores da partida" });
  }
}


module.exports = {
  adicionarJogadorController,
  removerJogadorController,
  listarJogadoresController,
  adicionarFuncaoJogadorController,
  removerFuncaoJogadorController,
  listarFuncoesJogadorController,
  atualizarFuncaoJogadorController,
  atualizarAtuacaoController,
  listarJogadoresPartidaController
};