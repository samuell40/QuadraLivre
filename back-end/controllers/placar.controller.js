const placarService = require('../services/placar.service');

async function cadastrarModalidadeController(req, res) {
  try {
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O nome da modalidade é obrigatório.' });
    }

    const nomeFormatado = nome.trim();

    const modalidade = await placarService.cadastrarModalidade(nomeFormatado);

    return res.status(201).json({
      mensagem: 'Modalidade cadastrada com sucesso!',
      modalidade
    });
  } catch (error) {
    console.error('Erro ao cadastrar modalidade:', error.message);

    if (error.message.includes('já existe')) {
      return res.status(400).json({ erro: error.message });
    }

    return res.status(500).json({ erro: error.message });
  }
}

async function removerModalidadeController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: 'ID da modalidade é obrigatório.' });
    }

    const modalidade = await placarService.removerModalidade(id);
    if (!modalidade) {
      return res.status(404).json({ erro: 'Modalidade não encontrada.' });
    }

    return res.status(200).json({ mensagem: 'Modalidade removida', modalidade });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
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
  try {
    const { nome, foto, modalidadeId } = req.body;

    if (!nome || !modalidadeId) {
      return res.status(400).json({ erro: 'Nome e modalidadeId são obrigatórios.' });
    }
    
    const timesExistentes = await placarService.listarTimesPorModalidade(Number(modalidadeId));
    const timeExistente = timesExistentes.find(t => t.nome.trim().toLowerCase() === nome.trim().toLowerCase());

    if (timeExistente) {
      return res.status(400).json({ erro: 'Já existe um time com esse nome nesta modalidade.' });
    }

    const time = await placarService.criarTime({ nome: nome.trim(), foto, modalidadeId: Number(modalidadeId) });
    return res.status(201).json({ mensagem: 'Time criado com sucesso.', time });

  } catch (error) {
    console.error('Erro ao criar time:', error);
    return res.status(500).json({ erro: error.message });
  }
}

async function removerTimeController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: 'ID do time é obrigatório.' });
    }

    const time = await placarService.removerTime(id);
    if (!time) {
      return res.status(404).json({ erro: 'Time não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Time removido', time });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarTimesPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ erro: 'modalidadeId é obrigatório.' });
    }

    const times = await placarService.listarTimesPorModalidade(Number(modalidadeId));
    res.status(200).json(times);

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function getTodosTimes(req, res) {
  try {
    const times = await placarService.listarTodosTimes();
    return res.status(200).json(times);
  } catch (error) {
    console.error('Erro ao listar todos os times:', error);
    return res.status(500).json({ erro: 'Erro ao listar todos os times.' });
  }
}

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
  cadastrarModalidadeController,
  removerModalidadeController,
  listarModalidadesController,
  criarTimeController,
  removerTimeController,
  listarTimesPorModalidadeController,
  getTodosTimes,
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