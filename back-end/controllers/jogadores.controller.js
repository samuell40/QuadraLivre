const jogadorService = require('../services/jogador.service');

async function adicionarJogadorController(req, res) {
  try {
    const { timeId, nome, foto, funcaoId, usuarioId } = req.body;

    if (!timeId) {
      return res.status(400).json({ message: "timeId é obrigatório" });
    }
    const dadosJogador = {
      timeId: Number(timeId),
      nome,
      foto
    };

    if (funcaoId) {
      dadosJogador.funcaoId = Number(funcaoId);
    }

    if (usuarioId) {
      dadosJogador.usuarioId = Number(usuarioId);
    }

    const novoJogador = await jogadorService.adicionarJogador(dadosJogador);

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

async function listarTodosJogadoresController(req, res) {
  try {
    const jogadores = await jogadorService.listarTodosJogadores();
    return res.json(jogadores);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
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

async function moverJogadorTimeController(req, res) {
  try {
    const { jogadorId, novoTimeId } = req.body;

    if (!jogadorId || !novoTimeId) {
      return res.status(400).json({ message: "jogadorId e novoTimeId são obrigatórios" });
    }

    const jogadorAtualizado = await jogadorService.moverJogadorDeTime(
      Number(jogadorId),
      Number(novoTimeId)
    );

    return res.status(200).json(jogadorAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  adicionarJogadorController,
  removerJogadorController,
  listarJogadoresController,
  listarTodosJogadoresController,
  adicionarFuncaoJogadorController,
  removerFuncaoJogadorController,
  listarFuncoesJogadorController,
  atualizarFuncaoJogadorController,
  moverJogadorTimeController
};