const modalidadeService = require('../services/modalidade.service');

async function cadastrarModalidadeController(req, res) {
  try {
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O nome da modalidade é obrigatório.' });
    }

    const nomeFormatado = nome.trim();

    const modalidadeCriada = await modalidadeService.cadastrarModalidade(nomeFormatado);

    return res.status(201).json({
      mensagem: 'Modalidade cadastrada com sucesso!',
      modalidade: modalidadeCriada
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

    const modalidadeRemovida = await modalidadeService.removerModalidade(id);

    if (!modalidadeRemovida) {
      return res.status(404).json({ erro: 'Modalidade não encontrada.' });
    }

    return res.status(200).json({
      mensagem: 'Modalidade removida com sucesso!',
      modalidade: modalidadeRemovida
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarModalidadesController(req, res) {
  try {
    const modalidades = await modalidadeService.listarModalidades();
    res.status(200).json(modalidades);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  cadastrarModalidadeController,
  removerModalidadeController,
  listarModalidadesController
};