const placarService = require('../services/placar.service');

async function cadastrarModalidadeController(req, res) {
  const { nome } = req.body;

  try {
    const modalidade = await placarService.cadastrarModalidade(nome);
    return res.status(201).json(modalidade);
  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
}

async function removerModalidadeController(req, res) {
  const { id } = req.params;

  try {
    const modalidade = await placarService.removerModalidade(id);
    return res.status(200).json({ mensagem: 'Modalidade removida', modalidade });
  } catch (error) {
    return res.status(404).json({ erro: error.message });
  }
}

async function listarModalidadesController(req, res) {
  try {
    const modalidades = await placarService.listarModalidades();
    res.status(200).json(modalidades);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function criarTimeController(req, res) {
  const { nome, foto, modalidadeId } = req.body;

  if (!nome || !modalidadeId) {
    return res.status(400).json({ erro: 'Nome e modalidadeId são obrigatórios' });
  }

  try {
    const time = await placarService.criarTime({ nome, foto, modalidadeId });
    res.status(201).json({ mensagem: 'Time criado', time });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

async function removerTimeController(req, res) {
  const { id } = req.params;

  try {
    const time = await placarService.removerTime(id);
    res.status(200).json({ mensagem: 'Time removido', time });
  } catch (error) {
    res.status(404).json({ erro: error.message });
  }
}

async function listarTimesPorModalidadeController(req, res) {
  const { modalidadeId } = req.params;

  if (!modalidadeId) {
    return res.status(400).json({ erro: 'modalidadeId é obrigatório' });
  }

  try {
    const times = await placarService.listarTimesPorModalidade(Number(modalidadeId));
    res.status(200).json(times);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function getTodosTimes(req, res) {
  try {
    const times = await placarService.listarTodosTimes();
    return res.json(times);
  } catch (error) {
    console.error('Erro ao listar todos os times:', error);
    return res.status(500).json({ error: 'Erro ao listar todos os times.' });
  }
}

async function criarPlacarController(req, res) {
  try {
    const placar = await placarService.criarPlacar(req.body);
    res.status(201).json({ mensagem: 'Placar criado ou já existente', placar });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function atualizarPlacarController(req, res) {
  const { id } = req.params;
  const campos = req.body;

  try {
    const placar = await placarService.atualizarPlacar(id, campos);
    res.status(200).json({ mensagem: 'Placar atualizado', placar });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function listarPlacarPorModalidadeController(req, res) {
  const { modalidadeId } = req.params;

  try {
    const placares = await placarService.listarPlacarPorModalidade(modalidadeId);
    res.status(200).json({ placares });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function resetarPlacarPorModalidadeController(req, res) {
  const { modalidadeId } = req.params;

  try {
    const resultado = await placarService.resetarPlacarPorModalidade(modalidadeId);
    res.status(200).json({ mensagem: 'Placar resetado', resultado });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function ocultarPlacarGeralController(req, res) {
  try {
    const resultado = await placarService.ocultarPlacarGeral();
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }
}

async function ocultarPlacarPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;
    const resultado = await placarService.ocultarPlacarPorModalidade(Number(modalidadeId));
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }
}

async function mostrarPlacarGeralController(req, res) {
  try {
    const resultado = await placarService.mostrarPlacarGeral();
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }
}

async function mostrarPlacarPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;
    const resultado = await placarService.mostrarPlacarPorModalidade(Number(modalidadeId));
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }
}

async function listarVisibilidadeController(req, res) {
  try {
    const resultado = await placarService.listarVisibilidade();
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  cadastrarModalidadeController,
  removerModalidadeController,
  listarModalidadesController,
  criarTimeController,
  removerTimeController,
  listarTimesPorModalidadeController, getTodosTimes,
  criarPlacarController,
  atualizarPlacarController,
  listarPlacarPorModalidadeController,
  resetarPlacarPorModalidadeController, ocultarPlacarGeralController, ocultarPlacarPorModalidadeController, mostrarPlacarGeralController, mostrarPlacarPorModalidadeController, listarVisibilidadeController
};