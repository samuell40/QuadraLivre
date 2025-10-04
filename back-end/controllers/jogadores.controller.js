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
      funcaoId: funcaoId ? Number(funcaoId) : null,
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
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome da função é obrigatório" });
    }

    const novaFuncao = await jogadorService.adicionarFuncaoJogador({ nome });

    return res.status(201).json(novaFuncao);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(400).json({ message: error.message });
  }
}

async function listarFuncoesJogadorController(req, res) {
  try {
    const funcoes = await jogadorService.listarFuncoesJogador();
    return res.status(200).json(funcoes);
  } catch (error) {
    console.error("Erro no controller:", error);
    return res.status(500).json({ message: error.message });
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

module.exports = {
  adicionarJogadorController,
  removerJogadorController,
  listarJogadoresController,
  adicionarFuncaoJogadorController,
  listarFuncoesJogadorController,
  atualizarFuncaoJogadorController,
  atualizarAtuacaoController
};