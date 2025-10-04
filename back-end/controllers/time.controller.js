const time = require('../services/time.service')

async function cadastrarModalidadeController(req, res) {
  try {
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O nome da modalidade é obrigatório.' });
    }

    const nomeFormatado = nome.trim();

    const modalidade = await time.cadastrarModalidade(nomeFormatado);

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

    const modalidade = await time.removerModalidade(id);
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
    const modalidades = await time.listarModalidades();
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

    const timesExistentes = await time.listarTimesPorModalidade(Number(modalidadeId));
    const timeExistente = timesExistentes.find(
      t => t.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (timeExistente) {
      return res.status(400).json({ erro: 'Já existe um time com esse nome nesta modalidade.' });
    }

    const novoTime = await time.criarTime({
      nome: nome.trim(),
      foto,
      modalidadeId: Number(modalidadeId)
    });

    return res.status(201).json({ mensagem: 'Time criado com sucesso.', time: novoTime });

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

    const timeRemovido = await time.removerTime(id);
    if (!timeRemovido) {
      return res.status(404).json({ erro: 'Time não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Time removido com sucesso', time: timeRemovido });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }
}

async function listarTimesPorModalidadeController(req, res) {
  try {
    const { modalidadeId } = req.params;

    if (!modalidadeId) {
      return res.status(400).json({ erro: 'modalidadeId é obrigatório.' });
    }

    const times = await time.listarTimesPorModalidade(Number(modalidadeId));
    res.status(200).json(times);

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function getTodosTimes(req, res) {
  try {
    const times = await time.listarTodosTimes();
    return res.status(200).json(times);
  } catch (error) {
    console.error('Erro ao listar todos os times:', error);
    return res.status(500).json({ erro: 'Erro ao listar todos os times.' });
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
}