const placarService = require('../services/placar.service');

async function criarPlacarController(req, res) {
  try {
    const { timeId } = req.body;

    if (!timeId) {
      return res.status(400).json({ erro: 'timeId é obrigatório.' });
    }

    const placar = await placarService.criarPlacar(req.body);
    return res.status(201).json({ mensagem: 'Placar criado ou já existente', placar });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function atualizarPlacarController(req, res) {
  try {
    const { id } = req.params;
    const campos = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do placar é obrigatório.' });
    }

    const placar = await placarService.atualizarPlacar(id, campos);
    return res.status(200).json({ mensagem: 'Placar atualizado', placar });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarPlacarPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ erro: 'modalidadeId é obrigatório.' });
    }

    const placares = await placarService.listarPlacarPorModalidade(Number(modalidadeId));
    return res.status(200).json({ placares });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function resetarPlacarPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ erro: 'modalidadeId é obrigatório.' });
    }

    const resultado = await placarService.resetarPlacarPorModalidade(Number(modalidadeId));
    return res.status(200).json({ mensagem: 'Placar resetado', resultado });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function ocultarPlacarGeralController(req, res) {
  try {
    const resultado = await placarService.ocultarPlacarGeral();
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function ocultarPlacarPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ erro: 'modalidadeId é obrigatório.' });
    }

    const resultado = await placarService.ocultarPlacarPorModalidade(Number(modalidadeId));
    return res.status(200).json(resultado);

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function mostrarPlacarGeralController(req, res) {
  try {
    const resultado = await placarService.mostrarPlacarGeral();
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function mostrarPlacarPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ erro: 'modalidadeId é obrigatório.' });
    }

    const resultado = await placarService.mostrarPlacarPorModalidade(Number(modalidadeId));
    return res.status(200).json(resultado);

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarVisibilidadeController(req, res) {
  try {
    const resultado = await placarService.listarVisibilidade();
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  criarPlacarController,
  atualizarPlacarController,
  listarPlacarPorModalidadeController,
  resetarPlacarPorModalidadeController,
  ocultarPlacarGeralController,
  ocultarPlacarPorModalidadeController,
  mostrarPlacarGeralController,
  mostrarPlacarPorModalidadeController,
  listarVisibilidadeController
};